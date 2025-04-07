const mongoose = require('mongoose');

const ClientFlagSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.ObjectId,
    ref: 'Client',
    required: [true, 'Please add a client']
  },
  flagType: {
    type: String,
    enum: ['High Risk', 'Billing Issue', 'Attendance Concern', 'Clinical Alert', 'VIP', 'Custom'],
    required: [true, 'Please specify flag type']
  },
  customFlagName: {
    type: String,
    required: function() {
      return this.flagType === 'Custom';
    }
  },
  severity: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  actionRequired: {
    type: Boolean,
    default: false
  },
  actionDescription: {
    type: String
  },
  dueDate: {
    type: Date
  },
  assignedTo: {
    type: mongoose.Schema.ObjectId,
    ref: 'Staff'
  },
  status: {
    type: String,
    enum: ['Active', 'Resolved', 'In Progress', 'Deferred'],
    default: 'Active'
  },
  resolutionNotes: {
    type: String
  },
  resolvedDate: {
    type: Date
  },
  resolvedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'Staff'
  },
  displayInChart: {
    type: Boolean,
    default: true
  },
  displayColor: {
    type: String,
    default: '#FF0000' // Red
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'Staff',
    required: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  updatedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'Staff'
  }
});

// Set updatedAt on save
ClientFlagSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Set resolvedDate when status changes to Resolved
ClientFlagSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'Resolved' && !this.resolvedDate) {
    this.resolvedDate = Date.now();
  }
  next();
});

module.exports = mongoose.model('ClientFlag', ClientFlagSchema);
