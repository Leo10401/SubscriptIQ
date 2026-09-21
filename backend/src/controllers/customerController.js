const Customer = require('../models/Customer');
const Subscription = require('../models/Subscription');
const SupportNote = require('../models/SupportNote');
const UsageEvent = require('../models/UsageEvent');
const ChurnSignal = require('../models/ChurnSignal');
const Renewal = require('../models/Renewal');
const AIDraft = require('../models/AIDraft');
const AuditLog = require('../models/AuditLog');
const { evaluateSubscriptionChurn } = require('../services/churnEngine');

exports.getCustomers = async (req, res) => {
  try {
    const { search, stage, ownerId, sortBy = 'createdAt', order = 'desc', limit = 50, page = 1 } = req.query;

    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { industry: { $regex: search, $options: 'i' } },
        { 'contacts.name': { $regex: search, $options: 'i' } },
        { 'contacts.email': { $regex: search, $options: 'i' } },
      ];
    }
    if (stage) query.lifecycleStage = stage;
    if (ownerId) query.ownerId = ownerId;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: order === 'asc' ? 1 : -1 };

    const [customers, total] = await Promise.all([
      Customer.find(query)
        .populate('ownerId', 'name email avatar role')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Customer.countDocuments(query),
    ]);

    // Attach active subscription summary & latest renewal risk to each customer
    const customerIds = customers.map((c) => c._id);
    const [subscriptions, renewals] = await Promise.all([
      Subscription.find({ customerId: { $in: customerIds } }).populate('planId'),
      Renewal.find({ customerId: { $in: customerIds } }),
    ]);

    const enriched = customers.map((c) => {
      const custObj = c.toObject();
      const subs = subscriptions.filter((s) => s.customerId.toString() === c._id.toString());
      const activeSub = subs.find((s) => s.status === 'active' || s.status === 'past_due') || subs[0];
      const renewal = renewals.find((r) => r.customerId.toString() === c._id.toString());

      return {
        ...custObj,
        activeSubscription: activeSub || null,
        renewal: renewal || null,
      };
    });

    return res.json({
      customers: enriched,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('getCustomers error:', error);
    return res.status(500).json({ message: 'Failed to fetch customers.' });
  }
};

exports.getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await Customer.findById(id).populate('ownerId', 'name email avatar role department');
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found.' });
    }

    const [subscriptions, supportNotes, usageEvents, churnSignals, renewal, aiDrafts] = await Promise.all([
      Subscription.find({ customerId: id }).populate('planId').sort({ createdAt: -1 }),
      SupportNote.find({ customerId: id }).populate('agentId', 'name email avatar').sort({ timestamp: -1 }),
      UsageEvent.find({ customerId: id }).sort({ timestamp: -1 }).limit(50),
      ChurnSignal.find({ customerId: id }).populate('ruleId').sort({ firedAt: -1 }),
      Renewal.findOne({ customerId: id }).populate('contributingSignals').populate('overriddenBy', 'name'),
      AIDraft.find({ customerId: id }).populate('reviewedBy', 'name').sort({ createdAt: -1 }),
    ]);

    return res.json({
      customer,
      subscriptions,
      supportNotes,
      usageEvents,
      churnSignals,
      renewal,
      aiDrafts,
    });
  } catch (error) {
    console.error('getCustomerById error:', error);
    return res.status(500).json({ message: 'Failed to fetch customer profile.' });
  }
};

exports.createCustomer = async (req, res) => {
  try {
    const { name, industry, size, contacts, ownerId, lifecycleStage, website, mrr, arr } = req.body;

    const customer = await Customer.create({
      name,
      industry: industry || 'Technology',
      size: size || '11-50',
      contacts: contacts || [],
      ownerId: ownerId || req.user._id,
      lifecycleStage: lifecycleStage || 'active',
      website: website || '',
      mrr: mrr || 0,
      arr: arr || (mrr ? mrr * 12 : 0),
      healthScore: 85,
    });

    await AuditLog.create({
      userId: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'CUSTOMER_CREATE',
      entityType: 'Customer',
      entityId: customer._id,
      after: customer.toObject(),
    });

    return res.status(201).json(customer);
  } catch (error) {
    console.error('createCustomer error:', error);
    return res.status(500).json({ message: 'Failed to create customer.' });
  }
};

exports.updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const before = await Customer.findById(id);
    if (!before) {
      return res.status(404).json({ message: 'Customer not found.' });
    }

    const updated = await Customer.findByIdAndUpdate(id, req.body, { new: true });

    await AuditLog.create({
      userId: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'CUSTOMER_UPDATE',
      entityType: 'Customer',
      entityId: updated._id,
      before: before.toObject(),
      after: updated.toObject(),
    });

    return res.json(updated);
  } catch (error) {
    console.error('updateCustomer error:', error);
    return res.status(500).json({ message: 'Failed to update customer.' });
  }
};

exports.deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await Customer.findByIdAndDelete(id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found.' });
    }

    // Clean up related sub-collections
    await Promise.all([
      Subscription.deleteMany({ customerId: id }),
      Renewal.deleteMany({ customerId: id }),
      SupportNote.deleteMany({ customerId: id }),
      UsageEvent.deleteMany({ customerId: id }),
      ChurnSignal.deleteMany({ customerId: id }),
      AIDraft.deleteMany({ customerId: id }),
    ]);

    await AuditLog.create({
      userId: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'CUSTOMER_DELETE',
      entityType: 'Customer',
      entityId: id,
      before: customer.toObject(),
    });

    return res.json({ message: 'Customer and related records successfully deleted.' });
  } catch (error) {
    console.error('deleteCustomer error:', error);
    return res.status(500).json({ message: 'Failed to delete customer.' });
  }
};
