const Renewal = require('../models/Renewal');
const Customer = require('../models/Customer');
const Subscription = require('../models/Subscription');
const AuditLog = require('../models/AuditLog');

exports.getRenewals = async (req, res) => {
  try {
    const { stage, risk_level, search } = req.query;
    const query = {};

    if (stage) query.stage = stage;
    if (risk_level) query.riskLevel = risk_level;

    let customerIds = null;
    if (search) {
      const matchingCustomers = await Customer.find({
        name: { $regex: search, $options: 'i' },
      }).select('_id');
      customerIds = matchingCustomers.map((c) => c._id);
      query.customerId = { $in: customerIds };
    }

    const renewals = await Renewal.find(query)
      .populate({
        path: 'customerId',
        populate: { path: 'ownerId', select: 'name email avatar' },
      })
      .populate({
        path: 'subscriptionId',
        populate: { path: 'planId' },
      })
      .populate('contributingSignals')
      .populate('overriddenBy', 'name email')
      .sort({ targetRenewalDate: 1 });

    return res.json(renewals);
  } catch (error) {
    console.error('getRenewals error:', error);
    return res.status(500).json({ message: 'Failed to fetch renewals pipeline.' });
  }
};

exports.getRenewalById = async (req, res) => {
  try {
    const { id } = req.params;
    const renewal = await Renewal.findById(id)
      .populate({
        path: 'customerId',
        populate: { path: 'ownerId', select: 'name email avatar' },
      })
      .populate({
        path: 'subscriptionId',
        populate: { path: 'planId' },
      })
      .populate('contributingSignals')
      .populate('overriddenBy', 'name email');

    if (!renewal) {
      return res.status(404).json({ message: 'Renewal record not found.' });
    }

    return res.json(renewal);
  } catch (error) {
    console.error('getRenewalById error:', error);
    return res.status(500).json({ message: 'Failed to fetch renewal details.' });
  }
};

exports.updateRenewalStage = async (req, res) => {
  try {
    const { id } = req.params;
    const { stage, notes } = req.body;

    const validStages = ['upcoming', 'at_risk', 'contacted', 'renewed', 'churned'];
    if (!validStages.includes(stage)) {
      return res.status(400).json({ message: `Invalid stage. Must be one of: ${validStages.join(', ')}` });
    }

    const renewal = await Renewal.findById(id);
    if (!renewal) {
      return res.status(404).json({ message: 'Renewal record not found.' });
    }

    const previousStage = renewal.stage;
    renewal.stage = stage;
    if (notes !== undefined) renewal.notes = notes;

    if (stage === 'contacted') {
      renewal.lastContactedAt = new Date();
    } else if (stage === 'renewed') {
      // Advance subscription renewal date by 1 year or 1 month
      const sub = await Subscription.findById(renewal.subscriptionId).populate('planId');
      if (sub) {
        const nextRenewal = new Date(sub.renewalDate);
        if (sub.planId && sub.planId.billingInterval === 'annual') {
          nextRenewal.setFullYear(nextRenewal.getFullYear() + 1);
        } else {
          nextRenewal.setMonth(nextRenewal.getMonth() + 1);
        }
        sub.renewalDate = nextRenewal;
        await sub.save();
      }
      await Customer.findByIdAndUpdate(renewal.customerId, { lifecycleStage: 'active' });
    } else if (stage === 'churned') {
      await Subscription.findByIdAndUpdate(renewal.subscriptionId, {
        status: 'canceled',
        endDate: new Date(),
      });
      await Customer.findByIdAndUpdate(renewal.customerId, { lifecycleStage: 'churned' });
    }

    await renewal.save();

    await AuditLog.create({
      userId: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'RENEWAL_STAGE_CHANGE',
      entityType: 'Renewal',
      entityId: id,
      before: { stage: previousStage },
      after: { stage, notes },
    });

    return res.json(renewal);
  } catch (error) {
    console.error('updateRenewalStage error:', error);
    return res.status(500).json({ message: 'Failed to update renewal stage.' });
  }
};

exports.overrideRenewalRisk = async (req, res) => {
  try {
    const { id } = req.params;
    const { overrideRiskLevel, reason } = req.body;

    if (!reason || reason.trim().length === 0) {
      return res.status(400).json({ message: 'A justification reason is required for risk overrides.' });
    }

    const validLevels = ['low', 'medium', 'high', null];
    if (!validLevels.includes(overrideRiskLevel)) {
      return res.status(400).json({ message: 'Invalid risk level.' });
    }

    const renewal = await Renewal.findById(id);
    if (!renewal) {
      return res.status(404).json({ message: 'Renewal not found.' });
    }

    const previousLevel = renewal.riskLevel;
    renewal.overrideRiskLevel = overrideRiskLevel;
    if (overrideRiskLevel) {
      renewal.riskLevel = overrideRiskLevel;
    }
    renewal.overriddenBy = req.user._id;
    renewal.overrideReason = reason;

    await renewal.save();

    await AuditLog.create({
      userId: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'RENEWAL_RISK_OVERRIDE',
      entityType: 'Renewal',
      entityId: id,
      before: { riskLevel: previousLevel },
      after: { riskLevel: renewal.riskLevel, overrideRiskLevel, reason },
      details: `Admin ${req.user.name} overridden risk level from ${previousLevel} to ${overrideRiskLevel}. Reason: ${reason}`,
    });

    return res.json(renewal);
  } catch (error) {
    console.error('overrideRenewalRisk error:', error);
    return res.status(500).json({ message: 'Failed to override renewal risk.' });
  }
};
