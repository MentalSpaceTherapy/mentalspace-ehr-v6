const mongoose = require('mongoose');

const AuthorizationSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.ObjectId,
    ref: 'Client',
    required: [true, 'Please add a client']
  },
  insurancePolicy: {
    type: mongoose.Schema.ObjectId,
    ref: 'InsurancePolicy',
    required: [true, 'Please add an insurance policy']
  },
  insuranceCarrier: {
    type: mongoose.Schema.ObjectId,
    ref: 'InsuranceCarrier',
    required: [true, 'Please add an insurance carrier']
  },
  authorizationNumber: {
    type: String,
    required: [true, 'Please add an authorization number']
  },
  serviceType: {
    type: String,
    required: [true, 'Please add a service type'],
    enum: ['Individual Therapy', 'Group Therapy', 'Family Therapy', 'Psychological Testing', 'Medication Management', 'Other']
  },
  billingCodes: [{
    type: String
  }],
  startDate: {
    type: Date,
    required: [true, 'Please add a start date']
  },
  endDate: {
    type: Date,
    required: [true, 'Please add an end date']
  },
  totalSessions: {
    type: Number,
    required: [true, 'Please add total sessions']
  },
  sessionsUsed: {
    type: Number,
    default: 0
  },
  sessionsRemaining: {
    type: Number
  },
  frequency: {
    type: String,
    enum: ['Weekly', 'Biweekly', 'Monthly', 'As Needed', 'Other']
  },
  status: {
    type: String,
    enum: ['Active', 'Pending', 'Expired', 'Exhausted', 'Cancelled'],
    default: 'Active'
  },
  approvedProvider: {
    type: mongoose.Schema.ObjectId,
    ref: 'Staff'
  },
  approvedDiagnoses: [{
    code: {
      type: String
    },
    description: {
      type: String
    }
  }],
  verificationDate: {
    type: Date
  },
  verifiedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'Staff'
  },
  verificationMethod: {
    type: String,
    enum: ['Phone', 'Portal', 'Fax', 'Email', 'Other']
  },
  verificationReference: {
    type: String
  },
  verificationNotes: {
    type: String
  },
  renewalStatus: {
    type: String,
    enum: ['Not Needed', 'Pending', 'Submitted', 'Approved', 'Denied'],
    default: 'Not Needed'
  },
  renewalDate: {
    type: Date
  },
  renewalNotes: {
    type: String
  },
  attachments: [{
    name: {
      type: String,
      required: [true, 'Please add attachment name']
    },
    fileUrl: {
      type: String,
      required: [true, 'Please add file URL']
    },
    uploadDate: {
      type: Date,
      default: Date.now
    },
    uploadedBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'Staff'
    }
  }],
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
AuthorizationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Calculate sessions remaining
AuthorizationSchema.pre('save', function(next) {
  this.sessionsRemaining = this.totalSessions - this.sessionsUsed;
  
  // Update status based on sessions and dates
  const now = new Date();
  if (this.endDate < now) {
    this.status = 'Expired';
  } else if (this.sessionsRemaining <= 0) {
    this.status = 'Exhausted';
  } else if (this.status !== 'Cancelled' && this.status !== 'Pending') {
    this.status = 'Active';
  }
  
  next();
});

module.exports = mongoose.model('Authorization', AuthorizationSchema);
