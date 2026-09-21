const mongoose = require('mongoose');

const aiDraftSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
      index: true,
    },
    renewalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Renewal',
    },
    type: {
      type: String,
      enum: ['summary', 'risk_explanation', 'retention_message', 'onboarding_message'],
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      default: 'AI Generated Draft',
    },
    content: {
      type: String,
      required: true,
    },
    originalPromptContext: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    status: {
      type: String,
      enum: ['pending_review', 'approved', 'edited', 'rejected', 'sent'],
      default: 'pending_review',
      index: true,
    },
    modelUsed: {
      type: String,
      default: 'nvidia/llama-3.1-nemotron-70b-instruct:free',
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedAt: {
      type: Date,
    },
    sentAt: {
      type: Date,
    },
    csmNotes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

aiDraftSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('AIDraft', aiDraftSchema);
