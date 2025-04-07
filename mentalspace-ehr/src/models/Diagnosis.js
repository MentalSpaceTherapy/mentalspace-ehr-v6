const mongoose = require('mongoose');

const DiagnosisSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Please add a diagnosis code'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please add a diagnosis description']
  },
  codeType: {
    type: String,
    enum: ['ICD-10', 'DSM-5'],
    required: [true, 'Please specify code type']
  },
  category: {
    type: String
  },
  subcategory: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  commonlyUsed: {
    type: Boolean,
    default: false
  },
  notes: {
    type: String
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

// Set updatedAt on save
DiagnosisSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Diagnosis', DiagnosisSchema);
