const mongoose = require('mongoose');

const EmailCampaignSchema = new mongoose.Schema({
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
  status: {
    type: String,
    enum: ['Draft', 'Scheduled', 'Sending', 'Sent', 'Paused', 'Cancelled'],
    default: 'Draft'
  },
  campaign: {
    type: mongoose.Schema.ObjectId,
    ref: 'Campaign',
    required: [true, 'Please add a parent campaign']
  },
  subject: {
    type: String,
    required: [true, 'Please add an email subject'],
    maxlength: [200, 'Subject cannot be more than 200 characters']
  },
  fromName: {
    type: String,
    required: [true, 'Please add a sender name'],
    maxlength: [100, 'From name cannot be more than 100 characters']
  },
  fromEmail: {
    type: String,
    required: [true, 'Please add a sender email'],
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  replyToEmail: {
    type: String,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  content: {
    htmlBody: {
      type: String,
      required: [true, 'Please add HTML content']
    },
    textBody: {
      type: String
    },
    template: {
      type: mongoose.Schema.ObjectId,
      ref: 'MessageTemplate'
    }
  },
  schedule: {
    sendDate: {
      type: Date
    },
    sendTime: {
      type: String
    },
    timezone: {
      type: String,
      default: 'UTC'
    },
    isScheduled: {
      type: Boolean,
      default: false
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
    }],
    totalCount: {
      type: Number,
      default: 0
    }
  },
  tracking: {
    enableOpenTracking: {
      type: Boolean,
      default: true
    },
    enableClickTracking: {
      type: Boolean,
      default: true
    },
    enableUnsubscribeTracking: {
      type: Boolean,
      default: true
    },
    utmSource: {
      type: String
    },
    utmMedium: {
      type: String,
      default: 'email'
    },
    utmCampaign: {
      type: String
    }
  },
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
    bounced: {
      type: Number,
      default: 0
    },
    complained: {
      type: Number,
      default: 0
    },
    unsubscribed: {
      type: Number,
      default: 0
    }
  },
  deliveryResults: [{
    recipient: {
      type: String,
      required: true
    },
    recipientType: {
      type: String,
      enum: ['Lead', 'Client', 'Contact'],
      required: true
    },
    recipientId: {
      type: mongoose.Schema.ObjectId,
      refPath: 'deliveryResults.recipientType'
    },
    status: {
      type: String,
      enum: ['Sent', 'Delivered', 'Opened', 'Clicked', 'Bounced', 'Complained', 'Unsubscribed'],
      default: 'Sent'
    },
    sentAt: {
      type: Date
    },
    deliveredAt: {
      type: Date
    },
    openedAt: {
      type: Date
    },
    clickedAt: {
      type: Date
    },
    clickedLinks: [{
      url: {
        type: String
      },
      clickedAt: {
        type: Date
      }
    }],
    bounceType: {
      type: String,
      enum: ['Hard', 'Soft', 'None'],
      default: 'None'
    },
    bounceReason: {
      type: String
    }
  }],
  attachments: [{
    name: {
      type: String,
      required: [true, 'Please add attachment name']
    },
    fileUrl: {
      type: String,
      required: [true, 'Please add file URL']
    },
    contentType: {
      type: String
    },
    size: {
      type: Number
    }
  }],
  tags: [{
    type: String
  }],
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
  },
  sentAt: {
    type: Date
  },
  completedAt: {
    type: Date
  }
});

// Set updatedAt on save
EmailCampaignSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Update recipient count
EmailCampaignSchema.pre('save', function(next) {
  let count = 0;
  
  if (this.recipients.leads) {
    count += this.recipients.leads.length;
  }
  
  if (this.recipients.clients) {
    count += this.recipients.clients.length;
  }
  
  if (this.recipients.contacts) {
    count += this.recipients.contacts.length;
  }
  
  this.recipients.totalCount = count;
  next();
});

module.exports = mongoose.model('EmailCampaign', EmailCampaignSchema);
