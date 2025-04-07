const mongoose = require('mongoose');

const MessageThreadSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a thread title'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  participants: [{
    participant: {
      type: mongoose.Schema.ObjectId,
      refPath: 'participants.participantModel',
      required: [true, 'Please add a participant']
    },
    participantModel: {
      type: String,
      enum: ['Staff', 'Client'],
      required: [true, 'Please specify participant type']
    },
    role: {
      type: String,
      enum: ['Owner', 'Member'],
      default: 'Member'
    },
    isActive: {
      type: Boolean,
      default: true
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    leftAt: {
      type: Date
    }
  }],
  type: {
    type: String,
    enum: ['Direct', 'Group', 'System', 'Support'],
    default: 'Direct'
  },
  category: {
    type: String,
    enum: ['Clinical', 'Administrative', 'Billing', 'Technical', 'Other'],
    default: 'Clinical'
  },
  client: {
    type: mongoose.Schema.ObjectId,
    ref: 'Client'
  },
  isEncrypted: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    enum: ['Active', 'Archived', 'Closed'],
    default: 'Active'
  },
  lastMessageAt: {
    type: Date,
    default: Date.now
  },
  messages: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Message'
  }],
  createdBy: {
    type: mongoose.Schema.ObjectId,
    refPath: 'createdByModel',
    required: [true, 'Please add creator']
  },
  createdByModel: {
    type: String,
    enum: ['Staff', 'Client', 'System'],
    required: [true, 'Please specify creator type']
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
MessageThreadSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('MessageThread', MessageThreadSchema);
