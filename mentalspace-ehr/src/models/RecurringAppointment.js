const mongoose = require('mongoose');

const RecurringAppointmentSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.ObjectId,
    ref: 'Client',
    required: [true, 'Please add a client']
  },
  provider: {
    type: mongoose.Schema.ObjectId,
    ref: 'Staff',
    required: [true, 'Please add a provider']
  },
  appointmentType: {
    type: String,
    enum: ['Initial Assessment', 'Individual Therapy', 'Group Therapy', 'Couples Therapy', 'Family Therapy', 'Medication Management', 'Consultation', 'Other'],
    required: [true, 'Please specify appointment type']
  },
  duration: {
    type: Number, // Duration in minutes
    required: [true, 'Please add a duration']
  },
  location: {
    type: String,
    enum: ['Office', 'Virtual', 'Phone', 'Home Visit', 'Other'],
    default: 'Office'
  },
  virtualMeetingLink: {
    type: String
  },
  recurrencePattern: {
    type: String,
    enum: ['Weekly', 'Biweekly', 'Monthly', 'Custom'],
    required: [true, 'Please specify recurrence pattern']
  },
  dayOfWeek: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    required: function() {
      return ['Weekly', 'Biweekly'].includes(this.recurrencePattern);
    }
  },
  dayOfMonth: {
    type: Number,
    min: 1,
    max: 31,
    required: function() {
      return this.recurrencePattern === 'Monthly';
    }
  },
  weekOfMonth: {
    type: Number,
    min: 1,
    max: 5,
    required: function() {
      return this.recurrencePattern === 'Monthly' && this.useWeekOfMonth;
    }
  },
  useWeekOfMonth: {
    type: Boolean,
    default: false
  },
  startTime: {
    type: String,
    required: [true, 'Please add a start time'],
    match: [
      /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
      'Please add a valid time in format HH:MM'
    ]
  },
  startDate: {
    type: Date,
    required: [true, 'Please add a start date']
  },
  endDate: {
    type: Date
  },
  numberOfOccurrences: {
    type: Number,
    min: 1
  },
  status: {
    type: String,
    enum: ['Active', 'Completed', 'Cancelled'],
    default: 'Active'
  },
  notes: {
    type: String
  },
  exceptions: [{
    date: {
      type: Date,
      required: true
    },
    reason: {
      type: String
    },
    isRescheduled: {
      type: Boolean,
      default: false
    },
    rescheduledTo: {
      type: Date
    }
  }],
  generatedAppointments: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Appointment'
  }],
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
RecurringAppointmentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Validate that either endDate or numberOfOccurrences is provided
RecurringAppointmentSchema.pre('save', function(next) {
  if (!this.endDate && !this.numberOfOccurrences) {
    const error = new Error('Either end date or number of occurrences must be provided');
    error.name = 'ValidationError';
    next(error);
  } else {
    next();
  }
});

module.exports = mongoose.model('RecurringAppointment', RecurringAppointmentSchema);
