const mongoose = require('mongoose');

const SupervisionRelationshipSchema = new mongoose.Schema({
  supervisor: {
    type: mongoose.Schema.ObjectId,
    ref: 'Staff',
    required: [true, 'Please add a supervisor']
  },
  supervisee: {
    type: mongoose.Schema.ObjectId,
    ref: 'Staff',
    required: [true, 'Please add a supervisee']
  },
  startDate: {
    type: Date,
    required: [true, 'Please add a start date']
  },
  endDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Completed'],
    default: 'Active'
  },
  supervisionType: {
    type: String,
    enum: ['Clinical', 'Administrative', 'Both'],
    default: 'Clinical'
  },
  requiredFrequency: {
    type: String,
    enum: ['Weekly', 'Biweekly', 'Monthly', 'AsNeeded'],
    default: 'Weekly'
  },
  requiredHoursPerMonth: {
    type: Number,
    default: 4
  },
  notes: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Prevent supervisee from being their own supervisor
SupervisionRelationshipSchema.pre('save', function(next) {
  if (this.supervisor.toString() === this.supervisee.toString()) {
    const error = new Error('Staff member cannot supervise themselves');
    error.name = 'ValidationError';
    next(error);
  } else {
    next();
  }
});

module.exports = mongoose.model('SupervisionRelationship', SupervisionRelationshipSchema);
