const mongoose = require('mongoose');

const changeHistorySchema = new mongoose.Schema({
  fromPlanId: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan' },
  toPlanId: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan' },
  date: { type: Date, default: Date.now },
  type: { type: String, enum: ['upgrade', 'downgrade', 'renewal', 'cancellation', 'pause', 'resume'], default: 'renewal' },
  reason: { type: String, default: '' },
});

const subscriptionSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
      index: true,
    },
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Plan',
      required: true,
    },
    planVersion: {
      type: Number,
      default: 1,
    },
    status: {
      type: String,
      enum: ['trial', 'active', 'past_due', 'paused', 'canceled'],
      default: 'active',
      index: true,
    },
    startDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    renewalDate: {
      type: Date,
      required: true,
      index: true,
    },
    endDate: {
      type: Date,
    },
    currentSeats: {
      type: Number,
      default: 5,
    },
    currentMonthlyPrice: {
      type: Number,
      required: true,
      default: 99,
    },
    autoRenew: {
      type: Boolean,
      default: true,
    },
    changeHistory: [changeHistorySchema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Subscription', subscriptionSchema);
