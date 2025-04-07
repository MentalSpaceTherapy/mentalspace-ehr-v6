const mongoose = require('mongoose');

const DashboardMetricSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a metric name'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  metricId: {
    type: String,
    required: [true, 'Please add a metric ID'],
    unique: true,
    trim: true,
    maxlength: [50, 'Metric ID cannot be more than 50 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  category: {
    type: String,
    enum: [
      'appointments', 
      'documentation', 
      'billing', 
      'clients', 
      'staff', 
      'system', 
      'crm',
      'performance',
      'financial',
      'compliance'
    ],
    required: [true, 'Please specify a metric category']
  },
  valueType: {
    type: String,
    enum: ['number', 'percentage', 'currency', 'time', 'count', 'text'],
    required: [true, 'Please specify a value type']
  },
  aggregationType: {
    type: String,
    enum: ['sum', 'average', 'count', 'min', 'max', 'latest', 'custom'],
    required: [true, 'Please specify an aggregation type']
  },
  calculationMethod: {
    type: String,
    required: [true, 'Please specify a calculation method']
  },
  dataSource: {
    type: String,
    required: [true, 'Please specify a data source']
  },
  refreshInterval: {
    type: Number,
    default: 3600, // 1 hour in seconds
    min: 0
  },
  thresholds: {
    warning: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    critical: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    }
  },
  trend: {
    enabled: {
      type: Boolean,
      default: false
    },
    period: {
      type: String,
      enum: ['day', 'week', 'month', 'quarter', 'year'],
      default: 'week'
    },
    comparisonType: {
      type: String,
      enum: ['previous', 'sameLastYear', 'average', 'target'],
      default: 'previous'
    }
  },
  targetValue: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  visibleToRoles: [{
    type: String,
    required: true
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  lastCalculated: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Pre-save middleware to update the updatedAt field
DashboardMetricSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Create indexes for faster lookups
DashboardMetricSchema.index({ metricId: 1 });
DashboardMetricSchema.index({ category: 1 });
DashboardMetricSchema.index({ visibleToRoles: 1 });

module.exports = mongoose.model('DashboardMetric', DashboardMetricSchema);
