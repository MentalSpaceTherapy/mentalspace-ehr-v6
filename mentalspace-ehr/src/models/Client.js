const mongoose = require('mongoose');

const ClientSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'Please add a first name']
  },
  lastName: {
    type: String,
    required: [true, 'Please add a last name']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  phone: {
    type: String,
    required: [true, 'Please add a phone number']
  },
  dateOfBirth: {
    type: Date,
    required: [true, 'Please add date of birth']
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Non-binary', 'Other', 'Prefer not to say']
  },
  insuranceInfo: {
    provider: String,
    policyNumber: String,
    groupNumber: String,
    insurancePhone: String,
    copay: Number,
    deductible: Number
  },
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Waitlist', 'Discharged', 'Inquiry'],
    default: 'Active'
  },
  assignedProvider: {
    type: mongoose.Schema.ObjectId,
    ref: 'Staff'
  },
  referralSource: String,
  intakeDate: {
    type: Date,
    default: Date.now
  },
  flags: [{
    type: String,
    enum: ['High Risk', 'Billing Issue', 'Attendance Concern', 'Clinical Alert', 'VIP']
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full name
ClientSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for age
ClientSchema.virtual('age').get(function() {
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
});

module.exports = mongoose.model('Client', ClientSchema);
