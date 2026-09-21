const Plan = require('../models/Plan');
const AuditLog = require('../models/AuditLog');

exports.getPlans = async (req, res) => {
  try {
    const { includeArchived } = req.query;
    const query = includeArchived === 'true' ? {} : { isArchived: false };
    const plans = await Plan.find(query).sort({ price: 1 });
    return res.json(plans);
  } catch (error) {
    console.error('getPlans error:', error);
    return res.status(500).json({ message: 'Failed to fetch plans.' });
  }
};

exports.createPlan = async (req, res) => {
  try {
    const { name, tier, price, billingInterval, description, entitlements, usageLimits } = req.body;

    const plan = await Plan.create({
      name,
      tier: tier || 'Growth',
      price,
      billingInterval: billingInterval || 'monthly',
      description: description || '',
      entitlements: entitlements || {},
      usageLimits: usageLimits || { seats: 5, apiCalls: 10000, storageGB: 50, integrations: 3 },
      version: 1,
    });

    await AuditLog.create({
      userId: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'PLAN_CREATE',
      entityType: 'Plan',
      entityId: plan._id,
      after: plan.toObject(),
    });

    return res.status(201).json(plan);
  } catch (error) {
    console.error('createPlan error:', error);
    return res.status(500).json({ message: 'Failed to create plan.' });
  }
};

exports.updatePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const before = await Plan.findById(id);
    if (!before) {
      return res.status(404).json({ message: 'Plan not found.' });
    }

    const updates = { ...req.body };
    // Increment version if price or tier changed
    if (updates.price !== undefined && updates.price !== before.price) {
      updates.version = (before.version || 1) + 1;
    }

    const updated = await Plan.findByIdAndUpdate(id, updates, { new: true });

    await AuditLog.create({
      userId: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'PLAN_UPDATE',
      entityType: 'Plan',
      entityId: updated._id,
      before: before.toObject(),
      after: updated.toObject(),
    });

    return res.json(updated);
  } catch (error) {
    console.error('updatePlan error:', error);
    return res.status(500).json({ message: 'Failed to update plan.' });
  }
};

exports.deletePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const plan = await Plan.findByIdAndUpdate(id, { isArchived: true }, { new: true });
    if (!plan) {
      return res.status(404).json({ message: 'Plan not found.' });
    }

    await AuditLog.create({
      userId: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'PLAN_ARCHIVE',
      entityType: 'Plan',
      entityId: id,
    });

    return res.json({ message: 'Plan archived successfully.', plan });
  } catch (error) {
    console.error('deletePlan error:', error);
    return res.status(500).json({ message: 'Failed to archive plan.' });
  }
};
