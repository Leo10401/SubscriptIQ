const mongoose = require('mongoose');

const planSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    tier: {
      type: String,
      enum: ['Starter', 'Growth', 'Professional', 'Enterprise'],
      default: 'Growth',
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    billingInterval: {
      type: String,
      enum: ['monthly', 'annual'],
      default: 'monthly',
    },
    description: {
      type: String,
      default: '',
    },
    entitlements: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
    },
    usageLimits: {
      seats: { type: Number, default: 5 },
      apiCalls: { type: Number, default: 10000 },
      storageGB: { type: Number, default: 50 },
      integrations: { type: Number, default: 3 },
    },
    version: {
      type: Number,
      default: 1,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Plan', planSchema);
