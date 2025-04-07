const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.ObjectId,
    refPath: 'senderModel',
    required: [true, 'Please add a sender']
  },
  senderModel: {
    type: String,
    enum: ['Staff', 'Client'],
    required: [true, 'Please specify sender type']
  },
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
  thread: {
    type: mongoose.Schema.ObjectId,
    ref: 'MessageThread',
    required: [true, 'Please add a thread reference']
  },
  subject: {
    type: String,
    maxlength: [200, 'Subject cannot be more than 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Please add message content']
  },
  isUrgent: {
    type: Boolean,
    default: false
  },
  isEncrypted: {
    type: Boolean,
    default: true
  },
  attachments: [{
    name: {
      type: String,
      required: [true, 'Please add attachment name']
    },
    fileUrl: {
      type: String,
      required: [true, 'Please add file URL']
    },
    fileType: {
      type: String
    },
    fileSize: {
      type: Number
    },
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],
  readReceipts: [{
    type: mongoose.Schema.ObjectId,
    ref: 'MessageReadReceipt'
  }],
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  status: {
    type: String,
    enum: ['Sent', 'Delivered', 'Read', 'Failed'],
    default: 'Sent'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Set updatedAt on save
MessageSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Message', MessageSchema);
