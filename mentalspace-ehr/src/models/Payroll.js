const mongoose = require('mongoose');

const PayrollSchema = new mongoose.Schema({
  staff: {
    type: mongoose.Schema.ObjectId,
    ref: 'Staff',
    required: [true, 'Please add a staff member']
  },
  payPeriodStart: {
    type: Date,
    required: [true, 'Please add pay period start date']
  },
  payPeriodEnd: {
    type: Date,
    required: [true, 'Please add pay period end date']
  },
  timesheets: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Timesheet'
  }],
  totalHours: {
    type: Number,
    default: 0
  },
  regularHours: {
    type: Number,
    default: 0
  },
  overtimeHours: {
    type: Number,
    default: 0
  },
  totalSessions: {
    type: Number,
    default: 0
  },
  grossAmount: {
    type: Number,
    required: [true, 'Please add gross amount']
  },
  deductions: [{
    type: {
      type: String,
      enum: ['Tax', 'Insurance', 'Retirement', 'Other'],
      required: [true, 'Please specify deduction type']
    },
    description: {
      type: String,
      required: [true, 'Please add deduction description']
    },
    amount: {
      type: Number,
      required: [true, 'Please add deduction amount']
    }
  }],
  netAmount: {
    type: Number,
    required: [true, 'Please add net amount']
  },
  status: {
    type: String,
    enum: ['Draft', 'Pending Approval', 'Approved', 'Paid', 'Rejected'],
    default: 'Draft'
  },
  paymentDate: {
    type: Date
  },
  paymentMethod: {
    type: String,
    enum: ['Direct Deposit', 'Check', 'Cash', 'Other'],
    default: 'Direct Deposit'
  },
  paymentReference: {
    type: String
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
  createdAt: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'Staff',
    required: true
  }
});

// Calculate net amount before saving
PayrollSchema.pre('save', function(next) {
  let totalDeductions = 0;
  
  if (this.deductions && this.deductions.length > 0) {
    this.deductions.forEach(deduction => {
      totalDeductions += deduction.amount;
    });
  }
  
  this.netAmount = this.grossAmount - totalDeductions;
  next();
});

module.exports = mongoose.model('Payroll', PayrollSchema);
