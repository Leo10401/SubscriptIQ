const AIDraft = require('../models/AIDraft');
const AuditLog = require('../models/AuditLog');
const {
  generateAccountSummary,
  explainRenewalRisk,
  draftOutreachMessage,
} = require('../services/openRouterService');

exports.summarizeCustomer = async (req, res) => {
  try {
    const { customerId } = req.params;
    const draft = await generateAccountSummary(customerId, req.user);
    return res.status(201).json(draft);
  } catch (error) {
    console.error('summarizeCustomer error:', error);
    return res.status(500).json({ message: error.message || 'Failed to generate account summary.' });
  }
};

exports.explainRisk = async (req, res) => {
  try {
    const { renewalId } = req.params;
    const draft = await explainRenewalRisk(renewalId, req.user);
    return res.status(201).json(draft);
  } catch (error) {
    console.error('explainRisk error:', error);
    return res.status(500).json({ message: error.message || 'Failed to generate risk explanation.' });
  }
};

exports.draftMessage = async (req, res) => {
  try {
    const { customerId } = req.params;
    const { type = 'retention' } = req.body;
    const draft = await draftOutreachMessage(customerId, type, req.user);
    return res.status(201).json(draft);
  } catch (error) {
    console.error('draftMessage error:', error);
    return res.status(500).json({ message: error.message || 'Failed to draft outreach message.' });
  }
};

exports.getDrafts = async (req, res) => {
  try {
    const { customerId, status, type } = req.query;
    const query = {};
    if (customerId) query.customerId = customerId;
    if (status) query.status = status;
    if (type) query.type = type;

    const drafts = await AIDraft.find(query)
      .populate('customerId', 'name industry lifecycleStage')
      .populate('renewalId')
      .populate('reviewedBy', 'name email avatar')
      .sort({ createdAt: -1 });

    return res.json(drafts);
  } catch (error) {
    console.error('getDrafts error:', error);
    return res.status(500).json({ message: 'Failed to fetch AI drafts.' });
  }
};

exports.getDraftById = async (req, res) => {
  try {
    const { id } = req.params;
    const draft = await AIDraft.findById(id)
      .populate('customerId')
      .populate('renewalId')
      .populate('reviewedBy', 'name email avatar');

    if (!draft) {
      return res.status(404).json({ message: 'AI draft not found.' });
    }

    return res.json(draft);
  } catch (error) {
    console.error('getDraftById error:', error);
    return res.status(500).json({ message: 'Failed to fetch AI draft.' });
  }
};

exports.reviewDraft = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, content, csmNotes } = req.body;

    const validStatuses = ['approved', 'edited', 'rejected', 'sent'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: `Invalid review status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const draft = await AIDraft.findById(id);
    if (!draft) {
      return res.status(404).json({ message: 'AI draft not found.' });
    }

    // Guardrail: Cannot mark as 'sent' directly from 'pending_review' without approval/edit
    if (status === 'sent' && draft.status === 'pending_review') {
      return res.status(400).json({
        message: 'Guardrail restriction: AI drafts must be approved or edited by a human before being marked as sent.',
      });
    }

    const beforeStatus = draft.status;
    draft.status = status;
    if (content !== undefined && content.trim() !== draft.content) {
      draft.content = content;
      if (status === 'approved') {
        draft.status = 'edited';
      }
    }
    if (csmNotes !== undefined) draft.csmNotes = csmNotes;

    draft.reviewedBy = req.user._id;
    draft.reviewedAt = new Date();
    if (status === 'sent') {
      draft.sentAt = new Date();
    }

    await draft.save();

    await AuditLog.create({
      userId: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: `AI_DRAFT_${status.toUpperCase()}`,
      entityType: 'AIDraft',
      entityId: draft._id,
      before: { status: beforeStatus },
      after: { status: draft.status, csmNotes, sentAt: draft.sentAt },
      details: `${req.user.name} (${req.user.role}) changed draft status to ${status}.`,
    });

    const populated = await AIDraft.findById(draft._id)
      .populate('customerId', 'name industry')
      .populate('reviewedBy', 'name email avatar');

    return res.json(populated);
  } catch (error) {
    console.error('reviewDraft error:', error);
    return res.status(500).json({ message: 'Failed to review AI draft.' });
  }
};
