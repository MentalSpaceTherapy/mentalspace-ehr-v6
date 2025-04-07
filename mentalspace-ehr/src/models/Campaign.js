const mongoose = require('mongoose');

const CampaignSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a campaign name'],
    trim: true,
    maxlength: [100, 'Campaign name cannot be more than 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  type: {
    type: String,
    enum: ['Email', 'SMS', 'Direct Mail', 'Social Media', 'Event', 'Referral', 'Other'],
    default: 'Email'
  },
  status: {
    type: String,
    enum: ['Draft', 'Active', 'Paused', 'Completed', 'Cancelled'],
    default: 'Draft'
  },
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  },
  targetAudience: {
    type: String,
    enum: ['Leads', 'Clients', 'Contacts', 'All'],
    default: 'Leads'
  },
  goals: {
    type: String
  },
  budget: {
    amount: {
      type: Number
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },
  tags: [{
    type: String
  }],
  metrics: {
    sent: {
      type: Number,
      default: 0
    },
    delivered: {
      type: Number,
      default: 0
    },
    opened: {
      type: Number,
      default: 0
    },
    clicked: {
      type: Number,
      default: 0
    },
    responded: {
      type: Number,
      default: 0
    },
    converted: {
      type: Number,
      default: 0
    },
    unsubscribed: {
      type: Number,
      default: 0
    },
    bounced: {
      type: Number,
      default: 0
    }
  },
  content: {
    subject: {
      type: String
    },
    body: {
      type: String
    },
    template: {
      type: mongoose.Schema.ObjectId,
      ref: 'MessageTemplate'
    }
  },
  schedule: {
    frequency: {
      type: String,
      enum: ['One-time', 'Daily', 'Weekly', 'Monthly', 'Custom'],
      default: 'One-time'
    },
    sendTime: {
      type: String
    },
    sendDays: [{
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    }],
    timezone: {
      type: String,
      default: 'UTC'
    }
  },
  recipients: {
    leads: [{
      type: mongoose.Schema.ObjectId,
      ref: 'Lead'
    }],
    clients: [{
      type: mongoose.Schema.ObjectId,
      ref: 'Client'
    }],
    contacts: [{
      type: mongoose.Schema.ObjectId,
      ref: 'Contact'
    }],
    segments: [{
      name: {
        type: String
      },
      criteria: {
        type: Object
      }
    }]
  },
  tasks: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Task'
  }],
  assignedTo: {
    type: mongoose.Schema.ObjectId,
    ref: 'Staff'
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
CampaignSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Campaign', CampaignSchema);
