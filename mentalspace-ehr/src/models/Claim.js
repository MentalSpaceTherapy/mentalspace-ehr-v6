const mongoose = require('mongoose');

const ClaimSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.ObjectId,
    ref: 'Client',
    required: [true, 'Please add a client']
  },
  provider: {
    type: mongoose.Schema.ObjectId,
    ref: 'Staff',
    required: [true, 'Please add a provider']
  },
  appointment: {
    type: mongoose.Schema.ObjectId,
    ref: 'Appointment'
  },
  note: {
    type: mongoose.Schema.ObjectId,
    ref: 'Note'
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
  authorization: {
    type: mongoose.Schema.ObjectId,
    ref: 'Authorization'
  },
  claimNumber: {
    type: String
  },
  serviceDate: {
    type: Date,
    required: [true, 'Please add a service date']
  },
  dateSubmitted: {
    type: Date
  },
  billingCodes: [{
    code: {
      type: String,
      required: [true, 'Please add a billing code']
    },
    description: {
      type: String
    },
    units: {
      type: Number,
      required: [true, 'Please add units'],
      default: 1
    },
    fee: {
      type: Number,
      required: [true, 'Please add a fee']
    },
    modifiers: [{
      type: String
    }],
    diagnosisPointers: [{
      type: Number
    }]
  }],
  diagnosisCodes: [{
    code: {
      type: String,
      required: [true, 'Please add a diagnosis code']
    },
    description: {
      type: String
    },
    codeType: {
      type: String,
      enum: ['ICD-10', 'DSM-5'],
      default: 'ICD-10'
    }
  }],
  placeOfService: {
    type: String,
    enum: ['11', '02', '12', '99', 'Other'],
    default: '11' // Office
  },
  totalCharged: {
    type: Number,
    required: [true, 'Please add total charged amount']
  },
  totalAllowed: {
    type: Number
  },
  totalPaid: {
    type: Number,
    default: 0
  },
  totalAdjustment: {
    type: Number,
    default: 0
  },
  patientResponsibility: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['Draft', 'Ready to Submit', 'Submitted', 'In Process', 'Denied', 'Partially Paid', 'Paid', 'Appealed', 'Closed'],
    default: 'Draft'
  },
  submissionMethod: {
    type: String,
    enum: ['Electronic', 'Paper', 'Portal', 'Other'],
    default: 'Electronic'
  },
  submissionNotes: {
    type: String
  },
  trackingNumber: {
    type: String
  },
  denialReason: {
    type: String
  },
  appealStatus: {
    type: String,
    enum: ['Not Appealed', 'Appeal Submitted', 'Appeal In Process', 'Appeal Successful', 'Appeal Denied'],
    default: 'Not Appealed'
  },
  appealDate: {
    type: Date
  },
  appealNotes: {
    type: String
  },
  payments: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Payment'
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
ClaimSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Calculate total charged if not provided
ClaimSchema.pre('save', function(next) {
  if (!this.totalCharged && this.billingCodes && this.billingCodes.length > 0) {
    this.totalCharged = this.billingCodes.reduce((total, code) => {
      return total + (code.fee * code.units);
    }, 0);
  }
  next();
});

module.exports = mongoose.model('Claim', ClaimSchema);
