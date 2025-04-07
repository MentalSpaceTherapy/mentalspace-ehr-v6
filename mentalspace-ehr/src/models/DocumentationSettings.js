const mongoose = require('mongoose');

const DocumentationSettingsSchema = new mongoose.Schema({
  practice: {
    type: mongoose.Schema.ObjectId,
    ref: 'Setting',
    required: [true, 'Please add a practice reference']
  },
  noteTypes: [{
    type: {
      type: String,
      enum: ['Initial Assessment', 'Progress Note', 'Treatment Plan', 'Discharge Summary', 'Group Note', 'Collateral Contact', 'Supervision Note', 'Other'],
      required: true
    },
    displayName: {
      type: String,
      required: true
    },
    description: {
      type: String
    },
    requireCoSign: {
      type: Boolean,
      default: false
    },
    coSignRoles: [{
      type: String,
      enum: ['PRACTICE_ADMIN', 'CLINICIAN', 'SUPERVISOR']
    }],
    completionDeadline: {
      type: Number, // Hours after session
      default: 24
    },
    lockAfterDays: {
      type: Number, // Days after signing
      default: 7
    },
    defaultTemplate: {
      type: mongoose.Schema.ObjectId,
      ref: 'NoteTemplate'
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  defaultSettings: {
    requireDiagnosis: {
      type: Boolean,
      default: true
    },
    requireBillingCode: {
      type: Boolean,
      default: true
    },
    autoLockNotes: {
      type: Boolean,
      default: true
    },
    allowTemplateCustomization: {
      type: Boolean,
      default: true
    },
    allowNoteEditing: {
      type: Boolean,
      default: true
    },
    trackNoteVersions: {
      type: Boolean,
      default: true
    },
    requireRiskAssessment: {
      type: Boolean,
      default: false
    },
    riskAssessmentFrequency: {
      type: String,
      enum: ['Every Session', 'Weekly', 'Monthly', 'Quarterly', 'As Needed'],
      default: 'As Needed'
    }
  },
  diagnosisCodeSet: {
    type: String,
    enum: ['ICD-10', 'DSM-5', 'Both'],
    default: 'Both'
  },
  customFields: [{
    name: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['Text', 'Number', 'Date', 'Boolean', 'Select', 'MultiSelect'],
      required: true
    },
    options: [{
      type: String
    }],
    required: {
      type: Boolean,
      default: false
    },
    displayInSummary: {
      type: Boolean,
      default: false
    },
    noteTypes: [{
      type: String,
      enum: ['Initial Assessment', 'Progress Note', 'Treatment Plan', 'Discharge Summary', 'Group Note', 'Collateral Contact', 'Supervision Note', 'Other']
    }]
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
DocumentationSettingsSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('DocumentationSettings', DocumentationSettingsSchema);
