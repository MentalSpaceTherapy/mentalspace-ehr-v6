const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SettingAuditLogSchema = new Schema({
  setting: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Setting',
    required: true
  },
  settingKey: {
    type: String,
    required: true,
    trim: true,
    maxlength: [100, 'Setting key cannot be more than 100 characters']
  },
  action: {
    type: String,
    required: true,
    enum: ['CREATE', 'UPDATE', 'DELETE']
  },
  previousValue: {
    type: mongoose.Schema.Types.Mixed
  },
  newValue: {
    type: mongoose.Schema.Types.Mixed
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    required: true
  },
  userIp: {
    type: String,
    maxlength: [50, 'IP address cannot be more than 50 characters']
  },
  userAgent: {
    type: String,
    maxlength: [500, 'User agent cannot be more than 500 characters']
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot be more than 500 characters']
  }
});

// Mask sensitive values in audit logs
SettingAuditLogSchema.pre('save', async function(next) {
  // Check if this is a sensitive setting (based on the key pattern or explicit marking)
  const sensitiveKeyPatterns = [
    'password',
    'secret',
    'key',
    'token',
    'credential',
    'apiKey',
    'apiSecret'
  ];
  
  const isSensitive = sensitiveKeyPatterns.some(pattern => 
    this.settingKey.toLowerCase().includes(pattern.toLowerCase())
  );
  
  if (isSensitive) {
    // Mask previous value if it exists and is a string
    if (this.previousValue && typeof this.previousValue === 'string') {
      this.previousValue = '[REDACTED]';
    } else if (this.previousValue && typeof this.previousValue === 'object') {
      // If it's an object, we need to mask any sensitive fields
      this.previousValue = '[REDACTED OBJECT]';
    }
    
    // Mask new value if it exists and is a string
    if (this.newValue && typeof this.newValue === 'string') {
      this.newValue = '[REDACTED]';
    } else if (this.newValue && typeof this.newValue === 'object') {
      // If it's an object, we need to mask any sensitive fields
      this.newValue = '[REDACTED OBJECT]';
    }
  }
  
  next();
});

// Create indexes for faster lookups and reporting
SettingAuditLogSchema.index({ setting: 1 });
SettingAuditLogSchema.index({ settingKey: 1 });
SettingAuditLogSchema.index({ action: 1 });
SettingAuditLogSchema.index({ user: 1 });
SettingAuditLogSchema.index({ timestamp: 1 });

module.exports = mongoose.model('SettingAuditLog', SettingAuditLogSchema);
