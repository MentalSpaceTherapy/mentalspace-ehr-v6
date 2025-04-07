const mongoose = require('mongoose');

const WaitlistSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.ObjectId,
    ref: 'Client',
    required: [true, 'Please add a client']
  },
  requestDate: {
    type: Date,
    default: Date.now,
    required: [true, 'Please add request date']
  },
  serviceRequested: {
    type: String,
    required: [true, 'Please specify service requested']
  },
  preferredProviders: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Staff'
  }],
  preferredDays: [{
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  }],
  preferredTimes: [{
    type: String,
    enum: ['Morning', 'Afternoon', 'Evening']
  }],
  urgency: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  notes: {
    type: String
  },
  status: {
    type: String,
    enum: ['Active', 'Contacted', 'Scheduled', 'Removed', 'Declined'],
    default: 'Active'
  },
  priority: {
    type: Number,
    default: 5,
    min: 1,
    max: 10
  },
  contactAttempts: [{
    date: {
      type: Date,
      default: Date.now
    },
    method: {
      type: String,
      enum: ['Phone', 'Email', 'Text', 'Portal', 'Other'],
      required: true
    },
    notes: {
      type: String
    },
    successful: {
      type: Boolean,
      default: false
    },
    staffMember: {
      type: mongoose.Schema.ObjectId,
      ref: 'Staff',
      required: true
    }
  }],
  scheduledAppointment: {
    type: mongoose.Schema.ObjectId,
    ref: 'Appointment'
  },
  scheduledDate: {
    type: Date
  },
  removalReason: {
    type: String,
    enum: ['Scheduled', 'Client Request', 'Unable to Contact', 'No Longer Needed', 'Referred Out', 'Other']
  },
  removalNotes: {
    type: String
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
WaitlistSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Update status to 'Contacted' when first successful contact attempt is added
WaitlistSchema.pre('save', function(next) {
  if (this.isModified('contactAttempts') && this.status === 'Active') {
    const successfulAttempts = this.contactAttempts.filter(attempt => attempt.successful);
    if (successfulAttempts.length > 0) {
      this.status = 'Contacted';
    }
  }
  next();
});

// Update status to 'Scheduled' when appointment is scheduled
WaitlistSchema.pre('save', function(next) {
  if (this.isModified('scheduledAppointment') && this.scheduledAppointment) {
    this.status = 'Scheduled';
    this.scheduledDate = Date.now();
    if (!this.removalReason) {
      this.removalReason = 'Scheduled';
    }
  }
  next();
});

module.exports = mongoose.model('Waitlist', WaitlistSchema);
