const Subscription = require('../models/Subscription');
const Plan = require('../models/Plan');
const Customer = require('../models/Customer');
const Renewal = require('../models/Renewal');
const AuditLog = require('../models/AuditLog');
const { evaluateSubscriptionChurn } = require('../services/churnEngine');

exports.getSubscriptions = async (req, res) => {
  try {
    const { customer_id, status } = req.query;
    const query = {};
    if (customer_id) query.customerId = customer_id;
    if (status) query.status = status;

    const subscriptions = await Subscription.find(query)
      .populate('customerId', 'name industry lifecycleStage ownerId')
      .populate('planId')
      .sort({ createdAt: -1 });

    return res.json(subscriptions);
  } catch (error) {
    console.error('getSubscriptions error:', error);
    return res.status(500).json({ message: 'Failed to fetch subscriptions.' });
  }
};

exports.getSubscriptionById = async (req, res) => {
  try {
    const { id } = req.params;
    const subscription = await Subscription.findById(id)
      .populate('customerId')
      .populate('planId')
      .populate('changeHistory.fromPlanId')
      .populate('changeHistory.toPlanId');

    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found.' });
    }

    const renewal = await Renewal.findOne({ subscriptionId: id }).populate('contributingSignals');

    return res.json({ subscription, renewal });
  } catch (error) {
    console.error('getSubscriptionById error:', error);
    return res.status(500).json({ message: 'Failed to fetch subscription details.' });
  }
};

exports.createSubscription = async (req, res) => {
  try {
    const { customerId, planId, startDate, renewalDate, currentSeats, autoRenew } = req.body;

    const plan = await Plan.findById(planId);
    if (!plan) return res.status(404).json({ message: 'Plan not found.' });

    const customer = await Customer.findById(customerId);
    if (!customer) return res.status(404).json({ message: 'Customer not found.' });

    const start = startDate ? new Date(startDate) : new Date();
    // Default renewal date 1 month or 1 year ahead
    let defaultRenewal = new Date(start);
    if (plan.billingInterval === 'annual') {
      defaultRenewal.setFullYear(defaultRenewal.getFullYear() + 1);
    } else {
      defaultRenewal.setMonth(defaultRenewal.getMonth() + 1);
    }

    const targetRenewalDate = renewalDate ? new Date(renewalDate) : defaultRenewal;

    const subscription = await Subscription.create({
      customerId,
      planId,
      planVersion: plan.version || 1,
      status: 'active',
      startDate: start,
      renewalDate: targetRenewalDate,
      currentSeats: currentSeats || 5,
      currentMonthlyPrice: plan.price,
      autoRenew: autoRenew !== undefined ? autoRenew : true,
    });

    // Update customer MRR & ARR
    customer.mrr = plan.price;
    customer.arr = plan.price * 12;
    await customer.save();

    // Create initial renewal record
    await Renewal.create({
      subscriptionId: subscription._id,
      customerId,
      targetRenewalDate: targetRenewalDate,
      stage: 'upcoming',
      riskLevel: 'low',
      riskScore: 0,
      generatedAt: new Date(),
    });

    await AuditLog.create({
      userId: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'SUBSCRIPTION_CREATE',
      entityType: 'Subscription',
      entityId: subscription._id,
      after: subscription.toObject(),
    });

    // Trigger evaluation
    await evaluateSubscriptionChurn(subscription._id);

    return res.status(201).json(subscription);
  } catch (error) {
    console.error('createSubscription error:', error);
    return res.status(500).json({ message: 'Failed to create subscription.' });
  }
};

exports.updateSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, planId, renewalDate, currentSeats, reason } = req.body;

    const subscription = await Subscription.findById(id).populate('planId');
    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found.' });
    }

    const before = subscription.toObject();

    // Check for Plan Upgrade / Downgrade
    if (planId && planId !== subscription.planId._id.toString()) {
      const newPlan = await Plan.findById(planId);
      if (newPlan) {
        const isUpgrade = newPlan.price > subscription.planId.price;
        const changeType = isUpgrade ? 'upgrade' : 'downgrade';

        subscription.changeHistory.push({
          fromPlanId: subscription.planId._id,
          toPlanId: newPlan._id,
          date: new Date(),
          type: changeType,
          reason: reason || `${changeType} to ${newPlan.name}`,
        });

        subscription.planId = newPlan._id;
        subscription.planVersion = newPlan.version || 1;
        subscription.currentMonthlyPrice = newPlan.price;

        // Update customer MRR/ARR
        await Customer.findByIdAndUpdate(subscription.customerId, {
          mrr: newPlan.price,
          arr: newPlan.price * 12,
        });
      }
    }

    if (status) {
      subscription.status = status;
      if (status === 'canceled') {
        subscription.endDate = new Date();
        // Update renewal stage to churned
        await Renewal.findOneAndUpdate(
          { subscriptionId: id },
          { stage: 'churned' }
        );
        await Customer.findByIdAndUpdate(subscription.customerId, {
          lifecycleStage: 'churned',
        });
      }
    }

    if (renewalDate) {
      subscription.renewalDate = new Date(renewalDate);
      await Renewal.findOneAndUpdate(
        { subscriptionId: id },
        { targetRenewalDate: new Date(renewalDate) }
      );
    }

    if (currentSeats !== undefined) {
      subscription.currentSeats = currentSeats;
    }

    await subscription.save();

    await AuditLog.create({
      userId: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'SUBSCRIPTION_UPDATE',
      entityType: 'Subscription',
      entityId: subscription._id,
      before,
      after: subscription.toObject(),
    });

    // Re-evaluate churn signals based on new state
    await evaluateSubscriptionChurn(subscription._id);

    return res.json(subscription);
  } catch (error) {
    console.error('updateSubscription error:', error);
    return res.status(500).json({ message: 'Failed to update subscription.' });
  }
};
