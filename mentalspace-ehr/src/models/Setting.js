const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SettingSchema = new Schema({
  key: {
    type: String,
    required: [true, 'Setting key is required'],
    unique: true,
    trim: true,
    maxlength: [100, 'Setting key cannot be more than 100 characters']
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: [true, 'Setting value is required']
  },
  category: {
    type: String,
    required: [true, 'Setting category is required'],
    enum: [
      'General',
      'Security',
      'Notifications',
      'Scheduling',
      'Documentation',
      'Billing',
      'Integrations',
      'Appearance',
      'Email',
      'SMS',
      'FeatureFlags',
      'System'
    ]
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  dataType: {
    type: String,
    required: [true, 'Data type is required'],
    enum: ['string', 'number', 'boolean', 'object', 'array', 'date']
  },
  isEncrypted: {
    type: Boolean,
    default: false
  },
  isSystem: {
    type: Boolean,
    default: false
  },
  isHidden: {
    type: Boolean,
    default: false
  },
  validationRules: {
    type: Object,
    default: {}
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    required: true
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

// Encrypt sensitive settings before saving
SettingSchema.pre('save', async function(next) {
  if (this.isEncrypted && this.isModified('value') && typeof this.value === 'string') {
    // In a real implementation, this would use a proper encryption library
    // For this demo, we'll just add a marker to indicate it would be encrypted
    this.value = `[ENCRYPTED]${this.value}`;
  }
  
  this.updatedAt = Date.now();
  next();
});

// Create index for faster lookups
SettingSchema.index({ key: 1 });
SettingSchema.index({ category: 1 });

module.exports = mongoose.model('Setting', SettingSchema);
