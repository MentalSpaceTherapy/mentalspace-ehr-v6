const mongoose = require('mongoose');

const MessageReadReceiptSchema = new mongoose.Schema({
  message: {
    type: mongoose.Schema.ObjectId,
    ref: 'Message',
    required: [true, 'Please add a message reference']
  },
  reader: {
    type: mongoose.Schema.ObjectId,
    refPath: 'readerModel',
    required: [true, 'Please add a reader']
  },
  readerModel: {
    type: String,
    enum: ['Staff', 'Client'],
    required: [true, 'Please specify reader type']
  },
  readAt: {
    type: Date,
    default: Date.now
  },
  deviceInfo: {
    type: String
  },
  ipAddress: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('MessageReadReceipt', MessageReadReceiptSchema);
