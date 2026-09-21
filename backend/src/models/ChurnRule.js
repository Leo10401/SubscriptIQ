const mongoose = require('mongoose');

const churnRuleSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    signalType: {
      type: String,
      enum: ['usage_drop', 'unresolved_support', 'negative_sentiment', 'payment_issue', 'plan_downgrade', 'low_engagement_pre_renewal', 'no_csm_contact'],
      required: true,
    },
    threshold: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    weight: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    points: {
      type: Number,
      default: 3,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('ChurnRule', churnRuleSchema);
