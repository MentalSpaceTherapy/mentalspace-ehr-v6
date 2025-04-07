const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'Staff',
    required: true
  },
  action: {
    type: String,
    required: [true, 'Please specify the action'],
    enum: ['CREATE', 'READ', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'EXPORT', 'PRINT', 'OTHER']
  },
  resourceType: {
    type: String,
    required: [true, 'Please specify the resource type'],
    enum: ['CLIENT', 'STAFF', 'APPOINTMENT', 'NOTE', 'BILLING', 'INSURANCE', 'SYSTEM', 'OTHER']
  },
  resourceId: {
    type: mongoose.Schema.ObjectId,
    required: false
  },
  description: {
    type: String,
    required: [true, 'Please provide a description of the action']
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  metadata: {
    type: Object
  }
});

// Index for efficient querying
AuditLogSchema.index({ user: 1, timestamp: -1 });
AuditLogSchema.index({ resourceType: 1, resourceId: 1 });
AuditLogSchema.index({ timestamp: -1 });

module.exports = mongoose.model('AuditLog', AuditLogSchema);
