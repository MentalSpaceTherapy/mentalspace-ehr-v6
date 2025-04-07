const mongoose = require('mongoose');

const MessageNotificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.ObjectId,
    refPath: 'recipientModel',
    required: [true, 'Please add a recipient']
  },
  recipientModel: {
    type: String,
    enum: ['Staff', 'Client'],
    required: [true, 'Please specify recipient type']
  },
  message: {
    type: mongoose.Schema.ObjectId,
    ref: 'Message'
  },
  thread: {
    type: mongoose.Schema.ObjectId,
    ref: 'MessageThread'
  },
  type: {
    type: String,
    enum: ['New Message', 'Mention', 'Thread Update', 'Urgent Message', 'System Alert'],
    required: [true, 'Please specify notification type']
  },
  title: {
    type: String,
    required: [true, 'Please add a notification title']
  },
  content: {
    type: String
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  deliveryMethods: [{
    type: String,
    enum: ['In-App', 'Email', 'SMS', 'Push'],
    default: 'In-App'
  }],
  deliveryStatus: {
    inApp: {
      type: String,
      enum: ['Pending', 'Delivered', 'Failed'],
      default: 'Pending'
    },
    email: {
      type: String,
      enum: ['Not Applicable', 'Pending', 'Sent', 'Delivered', 'Failed'],
      default: 'Not Applicable'
    },
    sms: {
      type: String,
      enum: ['Not Applicable', 'Pending', 'Sent', 'Delivered', 'Failed'],
      default: 'Not Applicable'
    },
    push: {
      type: String,
      enum: ['Not Applicable', 'Pending', 'Sent', 'Delivered', 'Failed'],
      default: 'Not Applicable'
    }
  },
  priority: {
    type: String,
    enum: ['Low', 'Normal', 'High', 'Urgent'],
    default: 'Normal'
  },
  expiresAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient querying
MessageNotificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('MessageNotification', MessageNotificationSchema);
