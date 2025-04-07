const mongoose = require('mongoose');

const ClientNoteSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.ObjectId,
    ref: 'Client',
    required: [true, 'Please add a client']
  },
  noteType: {
    type: String,
    enum: ['Administrative', 'Phone Call', 'Email', 'Insurance', 'Billing', 'Other'],
    required: [true, 'Please specify note type']
  },
  title: {
    type: String,
    required: [true, 'Please add a title']
  },
  content: {
    type: String,
    required: [true, 'Please add note content']
  },
  tags: [{
    type: String
  }],
  followUpRequired: {
    type: Boolean,
    default: false
  },
  followUpDate: {
    type: Date
  },
  followUpAssignedTo: {
    type: mongoose.Schema.ObjectId,
    ref: 'Staff'
  },
  followUpCompleted: {
    type: Boolean,
    default: false
  },
  followUpCompletedDate: {
    type: Date
  },
  followUpCompletedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'Staff'
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  privateAccessRoles: [{
    type: String,
    enum: ['PRACTICE_ADMIN', 'CLINICIAN', 'SUPERVISOR', 'INTERN', 'BILLING', 'RECEPTIONIST', 'SUPPORT', 'SYSTEM_ADMIN']
  }],
  editHistory: [{
    modifiedBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'Staff',
      required: true
    },
    modifiedAt: {
      type: Date,
      default: Date.now
    },
    previousContent: {
      type: String
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
ClientNoteSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Add to edit history when content is modified
ClientNoteSchema.pre('save', function(next) {
  if (this.isModified('content') && !this.isNew) {
    // Get the original document from the database
    this.constructor.findById(this._id)
      .then(originalDoc => {
        if (originalDoc) {
          this.editHistory.push({
            modifiedBy: this.updatedBy,
            modifiedAt: Date.now(),
            previousContent: originalDoc.content
          });
        }
        next();
      })
      .catch(err => next(err));
  } else {
    next();
  }
});

module.exports = mongoose.model('ClientNote', ClientNoteSchema);
