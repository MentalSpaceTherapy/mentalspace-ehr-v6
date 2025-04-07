const mongoose = require('mongoose');

const InsuranceCarrierSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a carrier name'],
    unique: true,
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  address: {
    street: {
      type: String,
      required: [true, 'Please add a street address']
    },
    city: {
      type: String,
      required: [true, 'Please add a city']
    },
    state: {
      type: String,
      required: [true, 'Please add a state']
    },
    zipCode: {
      type: String,
      required: [true, 'Please add a zip code']
    },
    country: {
      type: String,
      default: 'USA'
    }
  },
  phone: {
    type: String,
    required: [true, 'Please add a phone number']
  },
  fax: {
    type: String
  },
  website: {
    type: String
  },
  email: {
    type: String,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  electronicPayer: {
    type: Boolean,
    default: true
  },
  payerId: {
    type: String
  },
  claimSubmissionMethod: {
    type: String,
    enum: ['Electronic', 'Paper', 'Both'],
    default: 'Electronic'
  },
  claimFormat: {
    type: String,
    enum: ['837P', 'CMS-1500', 'Other'],
    default: '837P'
  },
  submissionPortal: {
    type: String
  },
  submissionCredentials: {
    username: {
      type: String
    },
    password: {
      type: String,
      select: false
    }
  },
  eligibilityVerificationMethod: {
    type: String,
    enum: ['Electronic', 'Phone', 'Portal', 'Other'],
    default: 'Electronic'
  },
  eligibilityPhone: {
    type: String
  },
  eligibilityPortal: {
    type: String
  },
  claimsPhone: {
    type: String
  },
  claimsEmail: {
    type: String
  },
  averagePaymentTime: {
    type: Number // Days
  },
  notes: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
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
InsuranceCarrierSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('InsuranceCarrier', InsuranceCarrierSchema);
