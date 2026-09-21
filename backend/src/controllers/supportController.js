const SupportNote = require('../models/SupportNote');
const Customer = require('../models/Customer');
const Subscription = require('../models/Subscription');
const { evaluateSubscriptionChurn } = require('../services/churnEngine');

exports.getSupportNotes = async (req, res) => {
  try {
    const { customer_id, sentiment, status, limit = 50 } = req.query;
    const query = {};
    if (customer_id) query.customerId = customer_id;
    if (sentiment) query.sentiment = sentiment;
    if (status) query.status = status;

    const notes = await SupportNote.find(query)
      .populate('agentId', 'name email avatar role')
      .populate('customerId', 'name industry lifecycleStage')
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));

    return res.json(notes);
  } catch (error) {
    console.error('getSupportNotes error:', error);
    return res.status(500).json({ message: 'Failed to fetch support notes.' });
  }
};

exports.createSupportNote = async (req, res) => {
  try {
    const { customerId, summary, details, channel, sentiment, status, severity, timestamp } = req.body;

    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found.' });
    }

    const note = await SupportNote.create({
      customerId,
      agentId: req.user._id,
      summary,
      details: details || '',
      channel: channel || 'ticket',
      sentiment: sentiment || 'neutral',
      status: status || 'resolved',
      severity: severity || 'medium',
      timestamp: timestamp ? new Date(timestamp) : new Date(),
    });

    // Re-evaluate churn signals for customer's active subscription
    const activeSub = await Subscription.findOne({ customerId, status: 'active' });
    if (activeSub) {
      await evaluateSubscriptionChurn(activeSub._id);
    }

    const populated = await SupportNote.findById(note._id)
      .populate('agentId', 'name email avatar')
      .populate('customerId', 'name');

    return res.status(201).json(populated);
  } catch (error) {
    console.error('createSupportNote error:', error);
    return res.status(500).json({ message: 'Failed to create support note.' });
  }
};
