const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    userName: {
      type: String,
      default: 'System User',
    },
    userRole: {
      type: String,
      default: 'Admin',
    },
    action: {
      type: String,
      required: true,
    },
    entityType: {
      type: String,
      required: true,
      enum: ['Customer', 'Plan', 'Subscription', 'Renewal', 'AIDraft', 'ChurnRule', 'User', 'System'],
    },
    entityId: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    before: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    after: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    details: {
      type: String,
      default: '',
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

auditLogSchema.index({ entityType: 1, timestamp: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
