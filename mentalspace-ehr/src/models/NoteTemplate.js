const mongoose = require('mongoose');

const NoteTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a template name'],
    unique: true,
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  noteType: {
    type: String,
    enum: ['Initial Assessment', 'Progress Note', 'Treatment Plan', 'Discharge Summary', 'Group Note', 'Collateral Contact', 'Supervision Note', 'Other'],
    required: [true, 'Please specify note type']
  },
  structure: {
    type: Object,
    required: [true, 'Please add template structure']
  },
  defaultContent: {
    type: Object,
    default: {}
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  requiredFields: [{
    fieldPath: {
      type: String,
      required: true
    },
    fieldName: {
      type: String,
      required: true
    },
    errorMessage: {
      type: String,
      default: 'This field is required'
    }
  }],
  accessRoles: [{
    type: String,
    enum: ['PRACTICE_ADMIN', 'CLINICIAN', 'SUPERVISOR', 'INTERN', 'BILLING', 'RECEPTIONIST', 'SUPPORT', 'SYSTEM_ADMIN']
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
NoteTemplateSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Ensure only one default template per note type
NoteTemplateSchema.pre('save', async function(next) {
  if (this.isDefault) {
    try {
      await this.constructor.updateMany(
        { 
          noteType: this.noteType, 
          isDefault: true,
          _id: { $ne: this._id }
        },
        { isDefault: false }
      );
    } catch (err) {
      return next(err);
    }
  }
  next();
});

module.exports = mongoose.model('NoteTemplate', NoteTemplateSchema);
