const mongoose = require('mongoose');

const TimesheetSchema = new mongoose.Schema({
  staff: {
    type: mongoose.Schema.ObjectId,
    ref: 'Staff',
    required: [true, 'Please add a staff member']
  },
  date: {
    type: Date,
    required: [true, 'Please add a date']
  },
  clockInTime: {
    type: Date,
    required: [true, 'Please add clock in time']
  },
  clockOutTime: {
    type: Date
  },
  breaks: [{
    startTime: {
      type: Date,
      required: [true, 'Please add break start time']
    },
    endTime: {
      type: Date
    },
    duration: {
      type: Number, // Duration in minutes
      default: 0
    },
    isPaid: {
      type: Boolean,
      default: false
    }
  }],
  totalHours: {
    type: Number,
    default: 0
  },
  totalBreakHours: {
    type: Number,
    default: 0
  },
  billableHours: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['Draft', 'Submitted', 'Approved', 'Rejected', 'Paid'],
    default: 'Draft'
  },
  notes: {
    type: String
  },
  approvedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'Staff'
  },
  approvedAt: {
    type: Date
  },
  rejectionReason: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Calculate total hours when saving
TimesheetSchema.pre('save', function(next) {
  // Only calculate if clock out time exists
  if (this.clockOutTime) {
    // Calculate total duration in milliseconds
    const totalDurationMs = this.clockOutTime - this.clockInTime;
    
    // Calculate total break duration in milliseconds
    let totalBreakMs = 0;
    this.breaks.forEach(breakPeriod => {
      if (breakPeriod.endTime) {
        const breakDurationMs = breakPeriod.endTime - breakPeriod.startTime;
        totalBreakMs += breakDurationMs;
        
        // Update break duration in minutes
        breakPeriod.duration = Math.round(breakDurationMs / (1000 * 60));
      }
    });
    
    // Convert to hours
    this.totalHours = parseFloat((totalDurationMs / (1000 * 60 * 60)).toFixed(2));
    this.totalBreakHours = parseFloat((totalBreakMs / (1000 * 60 * 60)).toFixed(2));
    
    // Calculate billable hours (total hours minus unpaid breaks)
    this.billableHours = parseFloat((this.totalHours - this.totalBreakHours).toFixed(2));
  }
  
  next();
});

module.exports = mongoose.model('Timesheet', TimesheetSchema);
