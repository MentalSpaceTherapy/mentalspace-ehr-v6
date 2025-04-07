const AuditLog = require('../models/AuditLog');

/**
 * Utility for logging audit events in the system
 * Ensures HIPAA compliance by tracking all data access and modifications
 */
exports.log = async (options) => {
  try {
    const { user, action, resourceType, resourceId, description, req, metadata } = options;
    
    // Create audit log entry
    await AuditLog.create({
      user,
      action,
      resourceType,
      resourceId,
      description,
      ipAddress: req ? req.ip : null,
      userAgent: req ? req.headers['user-agent'] : null,
      metadata
    });
  } catch (err) {
    // Log to console but don't throw - audit logging should not block operations
    console.error('Audit logging error:', err);
  }
};
