const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, default: '' },
  role: { type: String, default: 'Primary Contact' },
});

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    industry: {
      type: String,
      required: true,
      default: 'Technology',
    },
    size: {
      type: String,
      enum: ['1-10', '11-50', '51-200', '201-500', '500+'],
      default: '11-50',
    },
    contacts: [contactSchema],
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    lifecycleStage: {
      type: String,
      enum: ['trial', 'active', 'at_risk', 'churned'],
      default: 'active',
      index: true,
    },
    website: {
      type: String,
      default: '',
    },
    arr: {
      type: Number,
      default: 0,
    },
    mrr: {
      type: Number,
      default: 0,
    },
    healthScore: {
      type: Number,
      default: 85,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Customer', customerSchema);
