const ChurnRule = require('../models/ChurnRule');
const ChurnSignal = require('../models/ChurnSignal');
const AuditLog = require('../models/AuditLog');
const { runFullChurnEvaluation } = require('../services/churnEngine');

exports.getChurnRules = async (req, res) => {
  try {
    const rules = await ChurnRule.find().sort({ code: 1 });
    return res.json(rules);
  } catch (error) {
    console.error('getChurnRules error:', error);
    return res.status(500).json({ message: 'Failed to fetch churn rules.' });
  }
};

exports.updateChurnRule = async (req, res) => {
  try {
    const { id } = req.params;
    const before = await ChurnRule.findById(id);
    if (!before) {
      return res.status(404).json({ message: 'Churn rule not found.' });
    }

    const updated = await ChurnRule.findByIdAndUpdate(id, req.body, { new: true });

    await AuditLog.create({
      userId: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'CHURN_RULE_UPDATE',
      entityType: 'ChurnRule',
      entityId: updated._id,
      before: before.toObject(),
      after: updated.toObject(),
    });

    return res.json(updated);
  } catch (error) {
    console.error('updateChurnRule error:', error);
    return res.status(500).json({ message: 'Failed to update churn rule.' });
  }
};

exports.triggerEvaluationRun = async (req, res) => {
  try {
    console.log(`[Manual Trigger] Churn evaluation initiated by ${req.user.name} (${req.user.role})`);
    const results = await runFullChurnEvaluation();

    await AuditLog.create({
      userId: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'CHURN_EVALUATION_RUN',
      entityType: 'System',
      entityId: 'full_eval',
      details: `Evaluated ${results.evaluatedCount} subscriptions: ${results.highRiskCount} High, ${results.mediumRiskCount} Medium, ${results.lowRiskCount} Low.`,
    });

    return res.json({
      message: 'Churn evaluation completed successfully.',
      ...results,
    });
  } catch (error) {
    console.error('triggerEvaluationRun error:', error);
    return res.status(500).json({ message: 'Failed to run churn evaluation.' });
  }
};

exports.getChurnSignals = async (req, res) => {
  try {
    const { subscription_id, customer_id, limit = 50 } = req.query;
    const query = {};
    if (subscription_id) query.subscriptionId = subscription_id;
    if (customer_id) query.customerId = customer_id;

    const signals = await ChurnSignal.find(query)
      .populate('ruleId')
      .populate('customerId', 'name')
      .sort({ firedAt: -1 })
      .limit(parseInt(limit));

    return res.json(signals);
  } catch (error) {
    console.error('getChurnSignals error:', error);
    return res.status(500).json({ message: 'Failed to fetch churn signals.' });
  }
};
