const Subscription = require('../models/Subscription');
const Customer = require('../models/Customer');
const Renewal = require('../models/Renewal');
const UsageEvent = require('../models/UsageEvent');
const SupportNote = require('../models/SupportNote');
const ChurnRule = require('../models/ChurnRule');
const ChurnSignal = require('../models/ChurnSignal');

/**
 * Pure Rule Evaluator Functions
 */
const ruleEvaluators = {
  usage_drop: async (subscription, customer, rule) => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const recentEvents = await UsageEvent.find({
      customerId: customer._id,
      timestamp: { $gte: thirtyDaysAgo, $lte: now },
    });

    const priorEvents = await UsageEvent.find({
      customerId: customer._id,
      timestamp: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo },
    });

    const recentCount = recentEvents.reduce((acc, ev) => acc + (ev.count || 1), 0);
    const priorCount = priorEvents.reduce((acc, ev) => acc + (ev.count || 1), 0);

    const thresholdPercent = (rule.threshold && rule.threshold.dropPercent) || 40;

    if (priorCount > 0) {
      const dropPercent = Math.round(((priorCount - recentCount) / priorCount) * 100);
      if (dropPercent >= thresholdPercent) {
        return {
          fired: true,
          details: `Product usage dropped by ${dropPercent}% over the last 30 days (${recentCount} events vs ${priorCount} in previous period).`,
        };
      }
    } else if (recentCount === 0) {
      return {
        fired: true,
        details: `Zero product usage events logged in the last 30 days.`,
      };
    }

    return { fired: false };
  },

  unresolved_support: async (subscription, customer, rule) => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const minOpenTickets = (rule.threshold && rule.threshold.openTicketsCount) || 2;

    const openNotes = await SupportNote.find({
      customerId: customer._id,
      status: 'open',
      timestamp: { $gte: thirtyDaysAgo },
    });

    if (openNotes.length >= minOpenTickets) {
      return {
        fired: true,
        details: `${openNotes.length} unresolved support tickets in the last 30 days: "${openNotes[0].summary}" and others.`,
      };
    }

    return { fired: false };
  },

  negative_sentiment: async (subscription, customer, rule) => {
    const now = new Date();
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const negativeNotes = await SupportNote.find({
      customerId: customer._id,
      sentiment: 'negative',
      timestamp: { $gte: fourteenDaysAgo },
    });

    if (negativeNotes.length > 0) {
      return {
        fired: true,
        details: `Negative customer sentiment recorded in recent support notes: "${negativeNotes[0].summary}".`,
      };
    }

    return { fired: false };
  },

  payment_issue: async (subscription, customer, rule) => {
    if (subscription.status === 'past_due') {
      return {
        fired: true,
        details: `Subscription status is currently 'past_due' — payment failed or overdue.`,
      };
    }
    return { fired: false };
  },

  plan_downgrade: async (subscription, customer, rule) => {
    const now = new Date();
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const downgradeEvent = (subscription.changeHistory || []).find(
      (change) => change.type === 'downgrade' && new Date(change.date) >= sixtyDaysAgo
    );

    if (downgradeEvent) {
      return {
        fired: true,
        details: `Account downgraded subscription tier on ${new Date(downgradeEvent.date).toLocaleDateString()}: ${downgradeEvent.reason || 'Downgrade recorded'}.`,
      };
    }

    return { fired: false };
  },

  low_engagement_pre_renewal: async (subscription, customer, rule) => {
    const now = new Date();
    const renewalDate = new Date(subscription.renewalDate);
    const diffDays = Math.ceil((renewalDate - now) / (1000 * 60 * 60 * 24));

    if (diffDays >= 0 && diffDays <= 45) {
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const logins = await UsageEvent.find({
        customerId: customer._id,
        eventType: { $in: ['login', 'dashboard_view'] },
        timestamp: { $gte: thirtyDaysAgo },
      });

      const count = logins.reduce((acc, ev) => acc + (ev.count || 1), 0);
      const minLogins = (rule.threshold && rule.threshold.minLogins) || 5;

      if (count < minLogins) {
        return {
          fired: true,
          details: `Low user engagement ahead of renewal (${diffDays} days away): only ${count} logins in the last 30 days.`,
        };
      }
    }

    return { fired: false };
  },

  no_csm_contact: async (subscription, customer, rule) => {
    const now = new Date();
    const staleDays = (rule.threshold && rule.threshold.daysWithoutContact) || 45;
    const cutoffDate = new Date(now.getTime() - staleDays * 24 * 60 * 60 * 1000);

    const recentNote = await SupportNote.findOne({
      customerId: customer._id,
      timestamp: { $gte: cutoffDate },
    });

    if (!recentNote) {
      return {
        fired: true,
        details: `No recorded support or CSM touchpoint in over ${staleDays} days.`,
      };
    }

    return { fired: false };
  },
};

/**
 * Evaluates rules for a single subscription and updates/creates Renewal + Signals
 */
async function evaluateSubscriptionChurn(subscriptionId) {
  const subscription = await Subscription.findById(subscriptionId).populate('planId');
  if (!subscription) return null;

  const customer = await Customer.findById(subscription.customerId);
  if (!customer) return null;

  const activeRules = await ChurnRule.find({ isActive: true });
  
  // Clear previous non-resolved signals for this evaluation
  await ChurnSignal.deleteMany({ subscriptionId: subscription._id });

  const firedSignalIds = [];
  let totalRiskScore = 0;

  const weightPointsMap = {
    high: 4,
    medium: 2,
    low: 1,
  };

  for (const rule of activeRules) {
    const evaluator = ruleEvaluators[rule.signalType];
    if (evaluator) {
      try {
        const result = await evaluator(subscription, customer, rule);
        if (result && result.fired) {
          const rulePoints = rule.points || weightPointsMap[rule.weight] || 2;
          const signal = await ChurnSignal.create({
            subscriptionId: subscription._id,
            customerId: customer._id,
            ruleId: rule._id,
            ruleCode: rule.code,
            ruleName: rule.name,
            weight: rule.weight,
            points: rulePoints,
            details: result.details || rule.description,
            firedAt: new Date(),
          });

          firedSignalIds.push(signal._id);
          totalRiskScore += rulePoints;
        }
      } catch (err) {
        console.error(`Error evaluating rule ${rule.code}:`, err);
      }
    }
  }

  // Determine risk level based on aggregated score
  let riskLevel = 'low';
  if (totalRiskScore >= 6) {
    riskLevel = 'high';
  } else if (totalRiskScore >= 3) {
    riskLevel = 'medium';
  }

  // Update customer lifecycle stage if needed
  if (riskLevel === 'high' && customer.lifecycleStage !== 'churned') {
    customer.lifecycleStage = 'at_risk';
  } else if (riskLevel === 'low' && customer.lifecycleStage === 'at_risk') {
    customer.lifecycleStage = 'active';
  }
  await customer.save();

  // Find or create renewal record
  let renewal = await Renewal.findOne({ subscriptionId: subscription._id });
  
  // If no renewal exists or if renewal is within 90 days lead window
  if (!renewal) {
    renewal = new Renewal({
      subscriptionId: subscription._id,
      customerId: customer._id,
      targetRenewalDate: subscription.renewalDate,
      stage: riskLevel === 'high' ? 'at_risk' : 'upcoming',
      riskLevel: riskLevel,
      riskScore: totalRiskScore,
      contributingSignals: firedSignalIds,
      generatedAt: new Date(),
    });
  } else {
    // If manual override exists, honor overrideRiskLevel
    const effectiveRiskLevel = renewal.overrideRiskLevel || riskLevel;
    renewal.riskLevel = effectiveRiskLevel;
    renewal.riskScore = totalRiskScore;
    renewal.contributingSignals = firedSignalIds;
    renewal.targetRenewalDate = subscription.renewalDate;

    // Automatically transition to at_risk stage if high risk and still upcoming
    if (effectiveRiskLevel === 'high' && renewal.stage === 'upcoming') {
      renewal.stage = 'at_risk';
    }
  }

  await renewal.save();

  return {
    subscriptionId: subscription._id,
    customerId: customer._id,
    riskLevel: renewal.riskLevel,
    riskScore: totalRiskScore,
    firedSignalsCount: firedSignalIds.length,
    renewalId: renewal._id,
  };
}

/**
 * Runs evaluation across all active subscriptions in the system
 */
async function runFullChurnEvaluation() {
  const activeSubscriptions = await Subscription.find({
    status: { $in: ['active', 'past_due', 'trial'] },
  });

  const results = [];
  for (const sub of activeSubscriptions) {
    const result = await evaluateSubscriptionChurn(sub._id);
    if (result) results.push(result);
  }

  return {
    evaluatedCount: activeSubscriptions.length,
    highRiskCount: results.filter((r) => r.riskLevel === 'high').length,
    mediumRiskCount: results.filter((r) => r.riskLevel === 'medium').length,
    lowRiskCount: results.filter((r) => r.riskLevel === 'low').length,
    results,
  };
}

module.exports = {
  ruleEvaluators,
  evaluateSubscriptionChurn,
  runFullChurnEvaluation,
};
