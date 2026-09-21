const mongoose = require('mongoose');

const usageEventSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
      index: true,
    },
    eventType: {
      type: String,
      required: true,
      enum: ['login', 'api_call', 'feature_used', 'export', 'dashboard_view', 'integration_sync', 'seat_added'],
      default: 'api_call',
      index: true,
    },
    count: {
      type: Number,
      default: 1,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

usageEventSchema.index({ customerId: 1, timestamp: -1 });

module.exports = mongoose.model('UsageEvent', usageEventSchema);
