const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const IntegrationSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Integration name is required'],
    trim: true,
    maxlength: [100, 'Integration name cannot be more than 100 characters']
  },
  type: {
    type: String,
    required: [true, 'Integration type is required'],
    enum: [
      'EHR',
      'Billing',
      'Insurance',
      'Telehealth',
      'Scheduling',
      'Messaging',
      'Payment',
      'Analytics',
      'CRM',
      'Email',
      'SMS',
      'Calendar',
      'Other'
    ]
  },
  provider: {
    type: String,
    required: [true, 'Provider name is required'],
    trim: true,
    maxlength: [100, 'Provider name cannot be more than 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  status: {
    type: String,
    required: [true, 'Status is required'],
    enum: ['Active', 'Inactive', 'Pending', 'Failed'],
    default: 'Inactive'
  },
  credentials: {
    apiKey: {
      type: String,
      maxlength: [500, 'API key cannot be more than 500 characters']
    },
    apiSecret: {
      type: String,
      maxlength: [500, 'API secret cannot be more than 500 characters']
    },
    username: {
      type: String,
      maxlength: [100, 'Username cannot be more than 100 characters']
    },
    password: {
      type: String,
      maxlength: [100, 'Password cannot be more than 100 characters']
    },
    clientId: {
      type: String,
      maxlength: [100, 'Client ID cannot be more than 100 characters']
    },
    clientSecret: {
      type: String,
      maxlength: [100, 'Client secret cannot be more than 100 characters']
    },
    accessToken: {
      type: String,
      maxlength: [1000, 'Access token cannot be more than 1000 characters']
    },
    refreshToken: {
      type: String,
      maxlength: [1000, 'Refresh token cannot be more than 1000 characters']
    },
    tokenExpiresAt: {
      type: Date
    },
    baseUrl: {
      type: String,
      maxlength: [200, 'Base URL cannot be more than 200 characters']
    },
    customFields: {
      type: Object,
      default: {}
    }
  },
  settings: {
    type: Object,
    default: {}
  },
  syncSettings: {
    autoSync: {
      type: Boolean,
      default: false
    },
    syncFrequency: {
      type: String,
      enum: ['Hourly', 'Daily', 'Weekly', 'Monthly', 'Custom'],
      default: 'Daily'
    },
    customSyncInterval: {
      type: Number, // in minutes
      default: 1440 // 24 hours
    },
    lastSyncAt: {
      type: Date
    },
    nextSyncAt: {
      type: Date
    },
    syncDirection: {
      type: String,
      enum: ['Import', 'Export', 'Bidirectional'],
      default: 'Bidirectional'
    },
    dataTypes: [{
      type: String,
      enum: [
        'Appointments',
        'Clients',
        'Staff',
        'Billing',
        'Claims',
        'Payments',
        'Notes',
        'Documents',
        'Messages',
        'All'
      ]
    }]
  },
  webhookSettings: {
    enabled: {
      type: Boolean,
      default: false
    },
    url: {
      type: String,
      maxlength: [200, 'Webhook URL cannot be more than 200 characters']
    },
    secret: {
      type: String,
      maxlength: [100, 'Webhook secret cannot be more than 100 characters']
    },
    events: [{
      type: String
    }]
  },
  lastError: {
    message: {
      type: String,
      maxlength: [500, 'Error message cannot be more than 500 characters']
    },
    code: {
      type: String,
      maxlength: [50, 'Error code cannot be more than 50 characters']
    },
    timestamp: {
      type: Date
    },
    details: {
      type: Object
    }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Encrypt sensitive credentials before saving
IntegrationSchema.pre('save', async function(next) {
  // In a real implementation, this would use a proper encryption library
  // For this demo, we'll just add a marker to indicate it would be encrypted
  if (this.isModified('credentials.apiSecret')) {
    this.credentials.apiSecret = `[ENCRYPTED]${this.credentials.apiSecret}`;
  }
  
  if (this.isModified('credentials.password')) {
    this.credentials.password = `[ENCRYPTED]${this.credentials.password}`;
  }
  
  if (this.isModified('credentials.clientSecret')) {
    this.credentials.clientSecret = `[ENCRYPTED]${this.credentials.clientSecret}`;
  }
  
  if (this.isModified('credentials.accessToken')) {
    this.credentials.accessToken = `[ENCRYPTED]${this.credentials.accessToken}`;
  }
  
  if (this.isModified('credentials.refreshToken')) {
    this.credentials.refreshToken = `[ENCRYPTED]${this.credentials.refreshToken}`;
  }
  
  if (this.isModified('webhookSettings.secret')) {
    this.webhookSettings.secret = `[ENCRYPTED]${this.webhookSettings.secret}`;
  }
  
  this.updatedAt = Date.now();
  next();
});

// Create indexes for faster lookups
IntegrationSchema.index({ name: 1 });
IntegrationSchema.index({ type: 1 });
IntegrationSchema.index({ provider: 1 });
IntegrationSchema.index({ status: 1 });

module.exports = mongoose.model('Integration', IntegrationSchema);
