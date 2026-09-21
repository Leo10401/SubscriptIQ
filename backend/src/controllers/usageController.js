const UsageEvent = require('../models/UsageEvent');
const Customer = require('../models/Customer');
const { evaluateSubscriptionChurn } = require('../services/churnEngine');
const Subscription = require('../models/Subscription');

exports.getUsageEvents = async (req, res) => {
  try {
    const { customer_id, eventType, limit = 50 } = req.query;
    const query = {};
    if (customer_id) query.customerId = customer_id;
    if (eventType) query.eventType = eventType;

    const events = await UsageEvent.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));

    return res.json(events);
  } catch (error) {
    console.error('getUsageEvents error:', error);
    return res.status(500).json({ message: 'Failed to fetch usage events.' });
  }
};

exports.logUsageEvent = async (req, res) => {
  try {
    const { customerId, eventType, count = 1, metadata = {}, timestamp } = req.body;

    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found.' });
    }

    const event = await UsageEvent.create({
      customerId,
      eventType: eventType || 'api_call',
      count: parseInt(count) || 1,
      metadata,
      timestamp: timestamp ? new Date(timestamp) : new Date(),
    });

    // Optionally evaluate active subscription churn in the background
    const activeSub = await Subscription.findOne({ customerId, status: 'active' });
    if (activeSub) {
      evaluateSubscriptionChurn(activeSub._id).catch((err) => console.error('Churn eval err:', err));
    }

    return res.status(201).json(event);
  } catch (error) {
    console.error('logUsageEvent error:', error);
    return res.status(500).json({ message: 'Failed to log usage event.' });
  }
};
