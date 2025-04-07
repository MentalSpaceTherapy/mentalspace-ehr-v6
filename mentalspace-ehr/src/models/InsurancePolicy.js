const mongoose = require('mongoose');

const InsurancePolicySchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.ObjectId,
    ref: 'Client',
    required: [true, 'Please add a client']
  },
  insuranceProvider: {
    type: String,
    required: [true, 'Please add insurance provider name']
  },
  policyNumber: {
    type: String,
    required: [true, 'Please add policy number']
  },
  groupNumber: {
    type: String
  },
  policyHolderName: {
    type: String,
    required: [true, 'Please add policy holder name']
  },
  policyHolderRelationship: {
    type: String,
    enum: ['Self', 'Spouse', 'Child', 'Other'],
    default: 'Self'
  },
  policyHolderDateOfBirth: {
    type: Date
  },
  effectiveDate: {
    type: Date,
    required: [true, 'Please add effective date']
  },
  expirationDate: {
    type: Date
  },
  coverageType: {
    type: String,
    enum: ['Primary', 'Secondary', 'Tertiary'],
    default: 'Primary'
  },
  verificationDate: {
    type: Date
  },
  verificationMethod: {
    type: String,
    enum: ['Phone', 'Online', 'Fax', 'Email', 'Other'],
    default: 'Phone'
  },
  verifiedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'Staff'
  },
  copayAmount: {
    type: Number
  },
  coinsurancePercentage: {
    type: Number
  },
  deductibleAmount: {
    type: Number
  },
  deductibleMet: {
    type: Boolean,
    default: false
  },
  deductibleMetAmount: {
    type: Number,
    default: 0
  },
  outOfPocketMax: {
    type: Number
  },
  authorizationRequired: {
    type: Boolean,
    default: false
  },
  authorizationNumber: {
    type: String
  },
  authorizedVisits: {
    type: Number
  },
  authorizedVisitsUsed: {
    type: Number,
    default: 0
  },
  authorizationStartDate: {
    type: Date
  },
  authorizationEndDate: {
    type: Date
  },
  insurancePhone: {
    type: String
  },
  insuranceNotes: {
    type: String
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Pending Verification', 'Expired'],
    default: 'Pending Verification'
  },
  documents: [{
    name: {
      type: String,
      required: [true, 'Please add document name']
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
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Set updatedAt on save
InsurancePolicySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('InsurancePolicy', InsurancePolicySchema);
