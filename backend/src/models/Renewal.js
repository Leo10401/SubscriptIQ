const mongoose = require('mongoose');

const renewalSchema = new mongoose.Schema(
  {
    subscriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subscription',
      required: true,
      index: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
      index: true,
    },
    targetRenewalDate: {
      type: Date,
      required: true,
    },
    stage: {
      type: String,
      enum: ['upcoming', 'at_risk', 'contacted', 'renewed', 'churned'],
      default: 'upcoming',
      index: true,
    },
    riskLevel: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'low',
      index: true,
    },
    riskScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    contributingSignals: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ChurnSignal',
      },
    ],
    generatedAt: {
      type: Date,
      default: Date.now,
    },
    lastContactedAt: {
      type: Date,
    },
    notes: {
      type: String,
      default: '',
    },
    overriddenBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    overrideReason: {
      type: String,
      default: '',
    },
    overrideRiskLevel: {
      type: String,
      enum: ['low', 'medium', 'high', null],
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

renewalSchema.index({ stage: 1, riskLevel: 1 });

module.exports = mongoose.model('Renewal', renewalSchema);
