const cron = require('node-cron');
const Subscription = require('../models/Subscription');
const Renewal = require('../models/Renewal');
const { runFullChurnEvaluation } = require('./churnEngine');

/**
 * Generates Renewal records for subscriptions entering the 90-day lead window
 */
async function generateUpcomingRenewals() {
  const now = new Date();
  const ninetyDaysFromNow = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

  const subscriptions = await Subscription.find({
    status: { $in: ['active', 'past_due', 'trial'] },
    renewalDate: { $lte: ninetyDaysFromNow },
  });

  let createdCount = 0;
  for (const sub of subscriptions) {
    const existing = await Renewal.findOne({ subscriptionId: sub._id });
    if (!existing) {
      await Renewal.create({
        subscriptionId: sub._id,
        customerId: sub.customerId,
        targetRenewalDate: sub.renewalDate,
        stage: 'upcoming',
        riskLevel: 'low',
        riskScore: 0,
        generatedAt: new Date(),
      });
      createdCount++;
    }
  }

  console.log(`[RenewalJob] Processed upcoming subscriptions. Created ${createdCount} new renewal records.`);
  return createdCount;
}

/**
 * Initializes cron jobs
 */
function initCronJobs() {
  // Run daily at 00:00 (Midnight)
  cron.schedule('0 0 * * *', async () => {
    console.log('[Cron] Running daily renewal generation & churn evaluation...');
    try {
      await generateUpcomingRenewals();
      const evalResult = await runFullChurnEvaluation();
      console.log(`[Cron] Completed churn evaluation: ${evalResult.evaluatedCount} evaluated, ${evalResult.highRiskCount} High Risk.`);
    } catch (err) {
      console.error('[Cron] Error in daily background jobs:', err);
    }
  });

  console.log('[Cron] Background jobs scheduled (Daily at 00:00).');
}

module.exports = {
  generateUpcomingRenewals,
  initCronJobs,
};
