const mongoose = require('mongoose');

const DashboardAlertSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add an alert title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  message: {
    type: String,
    required: [true, 'Please add an alert message'],
    maxlength: [500, 'Message cannot be more than 500 characters']
  },
  type: {
    type: String,
    enum: ['info', 'warning', 'error', 'success'],
    default: 'info'
  },
  category: {
    type: String,
    enum: [
      'system', 
      'billing', 
      'documentation', 
      'compliance', 
      'appointment', 
      'client', 
      'staff',
      'security'
    ],
    required: [true, 'Please specify an alert category']
  },
  source: {
    type: String,
    required: [true, 'Please specify the alert source']
  },
  targetRoles: [{
    type: String,
    required: true
  }],
  targetStaff: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff'
  }],
  relatedEntity: {
    entityType: {
      type: String,
      enum: [
        'client', 
        'staff', 
        'appointment', 
        'note', 
        'claim', 
        'payment',
        'system',
        'integration'
      ]
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId
    }
  },
  actionRequired: {
    type: Boolean,
    default: false
  },
  actionLink: {
    type: String
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  expiresAt: {
    type: Date
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readBy: [{
    staff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Staff'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create indexes for faster lookups
DashboardAlertSchema.index({ category: 1 });
DashboardAlertSchema.index({ targetRoles: 1 });
DashboardAlertSchema.index({ targetStaff: 1 });
DashboardAlertSchema.index({ priority: 1 });
DashboardAlertSchema.index({ isActive: 1, expiresAt: 1 });
DashboardAlertSchema.index({ 'relatedEntity.entityType': 1, 'relatedEntity.entityId': 1 });

module.exports = mongoose.model('DashboardAlert', DashboardAlertSchema);
