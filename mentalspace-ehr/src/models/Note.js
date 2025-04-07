const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema({
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
  noteType: {
    type: String,
    enum: ['Initial Assessment', 'Progress Note', 'Treatment Plan', 'Discharge Summary', 'Group Note', 'Collateral Contact', 'Supervision Note', 'Other'],
    required: [true, 'Please specify note type']
  },
  templateUsed: {
    type: mongoose.Schema.ObjectId,
    ref: 'NoteTemplate'
  },
  title: {
    type: String,
    required: [true, 'Please add a title']
  },
  content: {
    type: Object,
    required: [true, 'Please add note content']
  },
  status: {
    type: String,
    enum: ['Draft', 'Completed', 'Signed', 'Co-Signed', 'Locked'],
    default: 'Draft'
  },
  signedAt: {
    type: Date
  },
  signedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'Staff'
  },
  coSignRequired: {
    type: Boolean,
    default: false
  },
  coSignedAt: {
    type: Date
  },
  coSignedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'Staff'
  },
  lockedAt: {
    type: Date
  },
  sessionDate: {
    type: Date,
    required: [true, 'Please add session date']
  },
  sessionDuration: {
    type: Number, // Duration in minutes
    required: [true, 'Please add session duration']
  },
  billable: {
    type: Boolean,
    default: true
  },
  billingCode: {
    type: String
  },
  billingStatus: {
    type: String,
    enum: ['Not Submitted', 'Ready for Billing', 'Submitted', 'Paid', 'Denied', 'N/A'],
    default: 'Not Submitted'
  },
  diagnosisCodes: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Diagnosis'
  }],
  versions: [{
    type: mongoose.Schema.ObjectId,
    ref: 'NoteVersion'
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
NoteSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Create a new version when content is modified
NoteSchema.pre('save', async function(next) {
  if (this.isModified('content') && !this.isNew) {
    try {
      const NoteVersion = mongoose.model('NoteVersion');
      const version = await NoteVersion.create({
        note: this._id,
        content: this.content,
        createdBy: this.updatedBy,
        createdAt: Date.now()
      });
      
      if (!this.versions) {
        this.versions = [];
      }
      
      this.versions.push(version._id);
    } catch (err) {
      return next(err);
    }
  }
  next();
});

module.exports = mongoose.model('Note', NoteSchema);
