const mongoose = require('mongoose');

const CompensationRuleSchema = new mongoose.Schema({
  staff: {
    type: mongoose.Schema.ObjectId,
    ref: 'Staff',
    required: [true, 'Please add a staff member']
  },
  compensationType: {
    type: String,
    enum: ['Hourly', 'Salary', 'PerSession', 'Commission', 'Mixed'],
    required: [true, 'Please specify compensation type']
  },
  hourlyRate: {
    type: Number,
    required: function() {
      return ['Hourly', 'Mixed'].includes(this.compensationType);
    }
  },
  sessionRate: {
    type: Number,
    required: function() {
      return ['PerSession', 'Mixed'].includes(this.compensationType);
    }
  },
  salaryAmount: {
    type: Number,
    required: function() {
      return ['Salary', 'Mixed'].includes(this.compensationType);
    }
  },
  salaryPeriod: {
    type: String,
    enum: ['Weekly', 'Biweekly', 'Monthly', 'Annually'],
    required: function() {
      return ['Salary', 'Mixed'].includes(this.compensationType);
    }
  },
  commissionPercentage: {
    type: Number,
    required: function() {
      return ['Commission', 'Mixed'].includes(this.compensationType);
    },
    min: [0, 'Commission percentage cannot be negative'],
    max: [100, 'Commission percentage cannot exceed 100']
  },
  effectiveDate: {
    type: Date,
    required: [true, 'Please add an effective date'],
    default: Date.now
  },
  endDate: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  notes: {
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
  }
});

module.exports = mongoose.model('CompensationRule', CompensationRuleSchema);
