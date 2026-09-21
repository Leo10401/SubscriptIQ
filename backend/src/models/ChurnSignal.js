const mongoose = require('mongoose');

const churnSignalSchema = new mongoose.Schema(
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
    ruleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ChurnRule',
      required: true,
    },
    ruleCode: {
      type: String,
      required: true,
    },
    ruleName: {
      type: String,
      required: true,
    },
    weight: {
      type: String,
      enum: ['low', 'medium', 'high'],
      required: true,
    },
    points: {
      type: Number,
      default: 2,
    },
    details: {
      type: String,
      required: true,
    },
    firedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    isResolved: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

churnSignalSchema.index({ customerId: 1, firedAt: -1 });

module.exports = mongoose.model('ChurnSignal', churnSignalSchema);
