const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
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
  startTime: {
    type: Date,
    required: [true, 'Please add a start time']
  },
  endTime: {
    type: Date,
    required: [true, 'Please add an end time']
  },
  duration: {
    type: Number, // Duration in minutes
    required: [true, 'Please add a duration']
  },
  appointmentType: {
    type: String,
    enum: ['Initial Assessment', 'Individual Therapy', 'Group Therapy', 'Couples Therapy', 'Family Therapy', 'Medication Management', 'Consultation', 'Other'],
    required: [true, 'Please specify appointment type']
  },
  location: {
    type: String,
    enum: ['Office', 'Virtual', 'Phone', 'Home Visit', 'Other'],
    default: 'Office'
  },
  virtualMeetingLink: {
    type: String
  },
  virtualMeetingPassword: {
    type: String
  },
  status: {
    type: String,
    enum: ['Scheduled', 'Confirmed', 'Completed', 'Cancelled', 'No-Show', 'Rescheduled'],
    default: 'Scheduled'
  },
  confirmationStatus: {
    type: String,
    enum: ['Not Sent', 'Sent', 'Confirmed', 'Declined'],
    default: 'Not Sent'
  },
  confirmationSentAt: {
    type: Date
  },
  confirmationResponseAt: {
    type: Date
  },
  cancellationReason: {
    type: String
  },
  cancellationFee: {
    type: Number,
    default: 0
  },
  notes: {
    type: String
  },
  reminderSettings: {
    email: {
      enabled: {
        type: Boolean,
        default: true
      },
      timing: {
        type: Number, // Hours before appointment
        default: 24
      },
      sent: {
        type: Boolean,
        default: false
      },
      sentAt: {
        type: Date
      }
    },
    sms: {
      enabled: {
        type: Boolean,
        default: true
      },
      timing: {
        type: Number, // Hours before appointment
        default: 2
      },
      sent: {
        type: Boolean,
        default: false
      },
      sentAt: {
        type: Date
      }
    }
  },
  recurringAppointment: {
    type: mongoose.Schema.ObjectId,
    ref: 'RecurringAppointment'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'Staff'
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
AppointmentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Validate that endTime is after startTime
AppointmentSchema.pre('save', function(next) {
  if (this.endTime <= this.startTime) {
    const error = new Error('End time must be after start time');
    error.name = 'ValidationError';
    next(error);
  } else {
    next();
  }
});

// Calculate duration if not provided
AppointmentSchema.pre('save', function(next) {
  if (!this.duration) {
    const durationMs = this.endTime - this.startTime;
    this.duration = Math.round(durationMs / (1000 * 60)); // Convert to minutes
  }
  next();
});

module.exports = mongoose.model('Appointment', AppointmentSchema);
