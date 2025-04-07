const mongoose = require('mongoose');

const DocumentationDeadlineSchema = new mongoose.Schema({
  staff: {
    type: mongoose.Schema.ObjectId,
    ref: 'Staff',
    required: [true, 'Please add a staff member']
  },
  documentationType: {
    type: String,
    enum: ['Progress Note', 'Assessment', 'Treatment Plan', 'Discharge Summary', 'Group Note', 'Other'],
    required: [true, 'Please specify documentation type']
  },
  deadlineHours: {
    type: Number,
    required: [true, 'Please specify deadline hours'],
    min: [1, 'Deadline must be at least 1 hour'],
    max: [168, 'Deadline cannot exceed 168 hours (7 days)']
  },
  gracePeriodHours: {
    type: Number,
    default: 0,
    min: [0, 'Grace period cannot be negative']
  },
  notificationEnabled: {
    type: Boolean,
    default: true
  },
  notificationIntervals: [{
    hoursBeforeDeadline: {
      type: Number,
      required: [true, 'Please specify notification interval']
    },
    notificationType: {
      type: String,
      enum: ['Email', 'SMS', 'System', 'All'],
      default: 'System'
    }
  }],
  enforcementAction: {
    type: String,
    enum: ['None', 'Warning', 'Supervisor Notification', 'Lock Schedule'],
    default: 'Warning'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'Staff',
    required: true
  }
});

module.exports = mongoose.model('DocumentationDeadline', DocumentationDeadlineSchema);
