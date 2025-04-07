const mongoose = require('mongoose');

const DashboardPreferenceSchema = new mongoose.Schema({
  staff: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    required: true
  },
  layout: {
    type: String,
    enum: ['default', 'compact', 'expanded', 'custom'],
    default: 'default'
  },
  widgets: [{
    widgetId: {
      type: String,
      required: true
    },
    position: {
      x: {
        type: Number,
        required: true
      },
      y: {
        type: Number,
        required: true
      },
      width: {
        type: Number,
        required: true,
        default: 1
      },
      height: {
        type: Number,
        required: true,
        default: 1
      }
    },
    visible: {
      type: Boolean,
      default: true
    },
    settings: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  }],
  defaultFilters: {
    dateRange: {
      type: String,
      enum: ['day', 'week', 'month', 'quarter', 'year', 'custom'],
      default: 'week'
    },
    customDateStart: {
      type: Date
    },
    customDateEnd: {
      type: Date
    },
    staffFilter: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Staff'
    }],
    locationFilter: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Location'
    }],
    additionalFilters: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  refreshInterval: {
    type: Number,
    default: 300, // 5 minutes in seconds
    min: 0
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
DashboardPreferenceSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Create a compound index for faster lookups
DashboardPreferenceSchema.index({ staff: 1 });

module.exports = mongoose.model('DashboardPreference', DashboardPreferenceSchema);
