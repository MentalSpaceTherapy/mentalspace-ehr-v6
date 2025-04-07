const mongoose = require('mongoose');

const DashboardWidgetSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a widget name'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  widgetId: {
    type: String,
    required: [true, 'Please add a widget ID'],
    unique: true,
    trim: true,
    maxlength: [50, 'Widget ID cannot be more than 50 characters']
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
      'metrics',
      'alerts',
      'messages',
      'tasks',
      'custom'
    ],
    required: [true, 'Please specify a widget category']
  },
  type: {
    type: String,
    enum: [
      'chart', 
      'table', 
      'list', 
      'metric', 
      'calendar', 
      'alert', 
      'custom'
    ],
    required: [true, 'Please specify a widget type']
  },
  chartType: {
    type: String,
    enum: [
      'bar', 
      'line', 
      'pie', 
      'area', 
      'scatter', 
      'radar', 
      'none'
    ],
    default: 'none'
  },
  dataSource: {
    type: String,
    required: [true, 'Please specify a data source']
  },
  refreshInterval: {
    type: Number,
    default: 300, // 5 minutes in seconds
    min: 0
  },
  defaultSize: {
    width: {
      type: Number,
      default: 1,
      min: 1,
      max: 4
    },
    height: {
      type: Number,
      default: 1,
      min: 1,
      max: 4
    }
  },
  allowedRoles: [{
    type: String,
    required: true
  }],
  defaultSettings: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  isActive: {
    type: Boolean,
    default: true
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
DashboardWidgetSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Create indexes for faster lookups
DashboardWidgetSchema.index({ widgetId: 1 });
DashboardWidgetSchema.index({ category: 1 });
DashboardWidgetSchema.index({ allowedRoles: 1 });

module.exports = mongoose.model('DashboardWidget', DashboardWidgetSchema);
