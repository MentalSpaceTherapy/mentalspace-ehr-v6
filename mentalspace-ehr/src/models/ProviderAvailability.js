const mongoose = require('mongoose');

const ProviderAvailabilitySchema = new mongoose.Schema({
  provider: {
    type: mongoose.Schema.ObjectId,
    ref: 'Staff',
    required: [true, 'Please add a provider']
  },
  dayOfWeek: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    required: [true, 'Please specify day of week']
  },
  startTime: {
    type: String,
    required: [true, 'Please add a start time'],
    match: [
      /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
      'Please add a valid time in format HH:MM'
    ]
  },
  endTime: {
    type: String,
    required: [true, 'Please add an end time'],
    match: [
      /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
      'Please add a valid time in format HH:MM'
    ]
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  location: {
    type: String,
    enum: ['Office', 'Virtual', 'Both', 'Other'],
    default: 'Office'
  },
  notes: {
    type: String
  },
  effectiveDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  isRecurring: {
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
ProviderAvailabilitySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Validate that endTime is after startTime
ProviderAvailabilitySchema.pre('save', function(next) {
  const startHour = parseInt(this.startTime.split(':')[0]);
  const startMinute = parseInt(this.startTime.split(':')[1]);
  const endHour = parseInt(this.endTime.split(':')[0]);
  const endMinute = parseInt(this.endTime.split(':')[1]);
  
  if (endHour < startHour || (endHour === startHour && endMinute <= startMinute)) {
    const error = new Error('End time must be after start time');
    error.name = 'ValidationError';
    next(error);
  } else {
    next();
  }
});

module.exports = mongoose.model('ProviderAvailability', ProviderAvailabilitySchema);
