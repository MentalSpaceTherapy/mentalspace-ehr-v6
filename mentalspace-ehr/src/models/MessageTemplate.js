const mongoose = require('mongoose');

const MessageTemplateSchema = new mongoose.Schema({
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
  subject: {
    type: String,
    required: [true, 'Please add a subject'],
    maxlength: [200, 'Subject cannot be more than 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Please add template content']
  },
  category: {
    type: String,
    enum: ['Appointment', 'Billing', 'Clinical', 'Administrative', 'Marketing', 'Other'],
    default: 'Administrative'
  },
  variables: [{
    name: {
      type: String,
      required: [true, 'Please add variable name']
    },
    description: {
      type: String
    },
    defaultValue: {
      type: String
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  accessRoles: [{
    type: String,
    enum: ['PRACTICE_ADMIN', 'CLINICIAN', 'SUPERVISOR', 'INTERN', 'BILLING', 'RECEPTIONIST', 'SUPPORT', 'SYSTEM_ADMIN']
  }],
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'Staff',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'Staff'
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Set updatedAt on save
MessageTemplateSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('MessageTemplate', MessageTemplateSchema);
