const mongoose = require('mongoose');

const LeadSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'Please add a first name'],
    trim: true,
    maxlength: [50, 'First name cannot be more than 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Please add a last name'],
    trim: true,
    maxlength: [50, 'Last name cannot be more than 50 characters']
  },
  email: {
    type: String,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  phone: {
    type: String,
    maxlength: [20, 'Phone number cannot be longer than 20 characters']
  },
  address: {
    street: {
      type: String,
      maxlength: [100, 'Street cannot be more than 100 characters']
    },
    city: {
      type: String,
      maxlength: [50, 'City cannot be more than 50 characters']
    },
    state: {
      type: String,
      maxlength: [50, 'State cannot be more than 50 characters']
    },
    zipCode: {
      type: String,
      maxlength: [20, 'Zip code cannot be more than 20 characters']
    },
    country: {
      type: String,
      maxlength: [50, 'Country cannot be more than 50 characters'],
      default: 'USA'
    }
  },
  source: {
    type: String,
    enum: ['Website', 'Referral', 'Social Media', 'Advertisement', 'Event', 'Phone Call', 'Email', 'Other'],
    default: 'Website'
  },
  sourceDetails: {
    type: String,
    maxlength: [200, 'Source details cannot be more than 200 characters']
  },
  status: {
    type: String,
    enum: ['New', 'Contacted', 'Qualified', 'Converted', 'Disqualified'],
    default: 'New'
  },
  stage: {
    type: String,
    enum: ['Inquiry', 'Initial Contact', 'Needs Assessment', 'Proposal', 'Onboarding', 'Closed'],
    default: 'Inquiry'
  },
  notes: {
    type: String
  },
  interestedServices: [{
    type: String,
    enum: ['Individual Therapy', 'Couples Therapy', 'Family Therapy', 'Group Therapy', 'Psychiatric Services', 'Psychological Testing', 'Other']
  }],
  preferredProvider: {
    type: mongoose.Schema.ObjectId,
    ref: 'Staff'
  },
  preferredContactMethod: {
    type: String,
    enum: ['Email', 'Phone', 'Text', 'Mail', 'No Preference'],
    default: 'No Preference'
  },
  preferredContactTime: {
    type: String,
    enum: ['Morning', 'Afternoon', 'Evening', 'No Preference'],
    default: 'No Preference'
  },
  insuranceInformation: {
    hasInsurance: {
      type: Boolean,
      default: false
    },
    insuranceCarrier: {
      type: String
    },
    policyNumber: {
      type: String
    },
    verificationStatus: {
      type: String,
      enum: ['Not Verified', 'Pending', 'Verified', 'Not Covered'],
      default: 'Not Verified'
    }
  },
  referralSource: {
    type: String
  },
  referredBy: {
    type: String
  },
  assignedTo: {
    type: mongoose.Schema.ObjectId,
    ref: 'Staff'
  },
  tags: [{
    type: String
  }],
  interactions: [{
    type: {
      type: String,
      enum: ['Call', 'Email', 'Meeting', 'Text', 'Other'],
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    },
    notes: {
      type: String
    },
    outcome: {
      type: String,
      enum: ['Successful', 'Unsuccessful', 'Follow-up Required', 'No Answer', 'Other'],
      default: 'Follow-up Required'
    },
    staff: {
      type: mongoose.Schema.ObjectId,
      ref: 'Staff',
      required: true
    }
  }],
  campaigns: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Campaign'
  }],
  tasks: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Task'
  }],
  convertedToClient: {
    type: Boolean,
    default: false
  },
  convertedClientId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Client'
  },
  conversionDate: {
    type: Date
  },
  disqualificationReason: {
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
LeadSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Lead', LeadSchema);
