const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Setting = require('../models/Setting');
const SettingAuditLog = require('../models/SettingAuditLog');
const auditLogger = require('../utils/auditLogger');

// @desc      Get all settings
// @route     GET /api/v1/settings
// @access    Private
exports.getSettings = asyncHandler(async (req, res, next) => {
  // Filter out hidden settings for non-admin users
  if (req.user.role !== 'SYSTEM_ADMIN' && req.user.role !== 'PRACTICE_ADMIN') {
    req.query.isHidden = false;
  }
  
  res.status(200).json(res.advancedResults);
});

// @desc      Get settings by category
// @route     GET /api/v1/settings/category/:category
// @access    Private
exports.getSettingsByCategory = asyncHandler(async (req, res, next) => {
  const { category } = req.params;
  
  // Validate category
  const validCategories = [
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
  ];
  
  if (!validCategories.includes(category)) {
    return next(
      new ErrorResponse(`Invalid category: ${category}`, 400)
    );
  }
  
  // Filter out hidden settings for non-admin users
  let query = { category };
  if (req.user.role !== 'SYSTEM_ADMIN' && req.user.role !== 'PRACTICE_ADMIN') {
    query.isHidden = false;
  }
  
  const settings = await Setting.find(query)
    .populate({
      path: 'createdBy',
      select: 'firstName lastName'
    })
    .populate({
      path: 'updatedBy',
      select: 'firstName lastName'
    });
  
  // Log the access
  await auditLogger.log({
    user: req.user.id,
    action: 'READ',
    resourceType: 'SETTINGS',
    description: `Accessed ${category} settings`,
    req
  });
  
  res.status(200).json({
    success: true,
    count: settings.length,
    data: settings
  });
});

// @desc      Get single setting
// @route     GET /api/v1/settings/:id
// @access    Private
exports.getSetting = asyncHandler(async (req, res, next) => {
  const setting = await Setting.findById(req.params.id)
    .populate({
      path: 'createdBy',
      select: 'firstName lastName'
    })
    .populate({
      path: 'updatedBy',
      select: 'firstName lastName'
    });
  
  if (!setting) {
    return next(
      new ErrorResponse(`Setting not found with id of ${req.params.id}`, 404)
    );
  }
  
  // Check if user has access to hidden settings
  if (setting.isHidden && req.user.role !== 'SYSTEM_ADMIN' && req.user.role !== 'PRACTICE_ADMIN') {
    return next(
      new ErrorResponse(`Not authorized to access this setting`, 403)
    );
  }
  
  // Log the access
  await auditLogger.log({
    user: req.user.id,
    action: 'READ',
    resourceType: 'SETTINGS',
    resourceId: setting._id,
    description: `Accessed setting: ${setting.key}`,
    req
  });
  
  res.status(200).json({
    success: true,
    data: setting
  });
});

// @desc      Get setting by key
// @route     GET /api/v1/settings/key/:key
// @access    Private
exports.getSettingByKey = asyncHandler(async (req, res, next) => {
  const { key } = req.params;
  
  const setting = await Setting.findOne({ key })
    .populate({
      path: 'createdBy',
      select: 'firstName lastName'
    })
    .populate({
      path: 'updatedBy',
      select: 'firstName lastName'
    });
  
  if (!setting) {
    return next(
      new ErrorResponse(`Setting not found with key of ${key}`, 404)
    );
  }
  
  // Check if user has access to hidden settings
  if (setting.isHidden && req.user.role !== 'SYSTEM_ADMIN' && req.user.role !== 'PRACTICE_ADMIN') {
    return next(
      new ErrorResponse(`Not authorized to access this setting`, 403)
    );
  }
  
  // Log the access
  await auditLogger.log({
    user: req.user.id,
    action: 'READ',
    resourceType: 'SETTINGS',
    resourceId: setting._id,
    description: `Accessed setting by key: ${setting.key}`,
    req
  });
  
  res.status(200).json({
    success: true,
    data: setting
  });
});

// @desc      Create setting
// @route     POST /api/v1/settings
// @access    Private (Admin only)
exports.createSetting = asyncHandler(async (req, res, next) => {
  // Add user to request body
  req.body.createdBy = req.user.id;
  req.body.updatedBy = req.user.id;
  
  // Check if setting with this key already exists
  const existingSetting = await Setting.findOne({ key: req.body.key });
  
  if (existingSetting) {
    return next(
      new ErrorResponse(`Setting with key ${req.body.key} already exists`, 400)
    );
  }
  
  // Validate data type and value
  if (!validateSettingValue(req.body.value, req.body.dataType)) {
    return next(
      new ErrorResponse(`Value does not match specified data type: ${req.body.dataType}`, 400)
    );
  }
  
  const setting = await Setting.create(req.body);
  
  // Create audit log entry
  await SettingAuditLog.create({
    setting: setting._id,
    settingKey: setting.key,
    action: 'CREATE',
    newValue: setting.value,
    user: req.user.id,
    userIp: req.ip,
    userAgent: req.headers['user-agent']
  });
  
  // Log the action
  await auditLogger.log({
    user: req.user.id,
    action: 'CREATE',
    resourceType: 'SETTINGS',
    resourceId: setting._id,
    description: `Created setting: ${setting.key}`,
    req
  });
  
  res.status(201).json({
    success: true,
    data: setting
  });
});

// @desc      Update setting
// @route     PUT /api/v1/settings/:id
// @access    Private (Admin only)
exports.updateSetting = asyncHandler(async (req, res, next) => {
  let setting = await Setting.findById(req.params.id);
  
  if (!setting) {
    return next(
      new ErrorResponse(`Setting not found with id of ${req.params.id}`, 404)
    );
  }
  
  // Check if system setting
  if (setting.isSystem && req.user.role !== 'SYSTEM_ADMIN') {
    return next(
      new ErrorResponse(`System settings can only be modified by system administrators`, 403)
    );
  }
  
  // Add user to request body
  req.body.updatedBy = req.user.id;
  
  // Validate data type and value if provided
  if (req.body.value !== undefined) {
    const dataType = req.body.dataType || setting.dataType;
    if (!validateSettingValue(req.body.value, dataType)) {
      return next(
        new ErrorResponse(`Value does not match specified data type: ${dataType}`, 400)
      );
    }
  }
  
  // Store previous value for audit log
  const previousValue = setting.value;
  
  // Update setting
  setting = await Setting.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  
  // Create audit log entry
  await SettingAuditLog.create({
    setting: setting._id,
    settingKey: setting.key,
    action: 'UPDATE',
    previousValue,
    newValue: setting.value,
    user: req.user.id,
    userIp: req.ip,
    userAgent: req.headers['user-agent']
  });
  
  // Log the action
  await auditLogger.log({
    user: req.user.id,
    action: 'UPDATE',
    resourceType: 'SETTINGS',
    resourceId: setting._id,
    description: `Updated setting: ${setting.key}`,
    req
  });
  
  res.status(200).json({
    success: true,
    data: setting
  });
});

// @desc      Delete setting
// @route     DELETE /api/v1/settings/:id
// @access    Private (Admin only)
exports.deleteSetting = asyncHandler(async (req, res, next) => {
  const setting = await Setting.findById(req.params.id);
  
  if (!setting) {
    return next(
      new ErrorResponse(`Setting not found with id of ${req.params.id}`, 404)
    );
  }
  
  // Check if system setting
  if (setting.isSystem) {
    return next(
      new ErrorResponse(`System settings cannot be deleted`, 403)
    );
  }
  
  // Store setting info for audit log
  const settingId = setting._id;
  const settingKey = setting.key;
  const previousValue = setting.value;
  
  await setting.remove();
  
  // Create audit log entry
  await SettingAuditLog.create({
    setting: settingId,
    settingKey,
    action: 'DELETE',
    previousValue,
    user: req.user.id,
    userIp: req.ip,
    userAgent: req.headers['user-agent']
  });
  
  // Log the action
  await auditLogger.log({
    user: req.user.id,
    action: 'DELETE',
    resourceType: 'SETTINGS',
    resourceId: settingId,
    description: `Deleted setting: ${settingKey}`,
    req
  });
  
  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc      Get setting audit logs
// @route     GET /api/v1/settings/:id/audit-logs
// @access    Private (Admin only)
exports.getSettingAuditLogs = asyncHandler(async (req, res, next) => {
  const setting = await Setting.findById(req.params.id);
  
  if (!setting) {
    return next(
      new ErrorResponse(`Setting not found with id of ${req.params.id}`, 404)
    );
  }
  
  const auditLogs = await SettingAuditLog.find({ setting: req.params.id })
    .populate({
      path: 'user',
      select: 'firstName lastName email'
    })
    .sort({ timestamp: -1 });
  
  // Log the access
  await auditLogger.log({
    user: req.user.id,
    action: 'READ',
    resourceType: 'SETTINGS',
    resourceId: setting._id,
    description: `Accessed audit logs for setting: ${setting.key}`,
    req
  });
  
  res.status(200).json({
    success: true,
    count: auditLogs.length,
    data: auditLogs
  });
});

// @desc      Bulk update settings
// @route     PUT /api/v1/settings/bulk
// @access    Private (Admin only)
exports.bulkUpdateSettings = asyncHandler(async (req, res, next) => {
  const { settings } = req.body;
  
  if (!settings || !Array.isArray(settings) || settings.length === 0) {
    return next(
      new ErrorResponse('Please provide an array of settings to update', 400)
    );
  }
  
  const results = {
    success: [],
    failed: []
  };
  
  // Process each setting
  for (const settingData of settings) {
    try {
      // Validate required fields
      if (!settingData.key) {
        results.failed.push({
          key: settingData.key || 'unknown',
          error: 'Setting key is required'
        });
        continue;
      }
      
      // Find setting by key
      const setting = await Setting.findOne({ key: settingData.key });
      
      if (!setting) {
        results.failed.push({
          key: settingData.key,
          error: 'Setting not found'
        });
        continue;
      }
      
      // Check if system setting
      if (setting.isSystem && req.user.role !== 'SYSTEM_ADMIN') {
        results.failed.push({
          key: settingData.key,
          error: 'System settings can only be modified by system administrators'
        });
        continue;
      }
      
      // Validate data type and value
      if (!validateSettingValue(settingData.value, setting.dataType)) {
        results.failed.push({
          key: settingData.key,
          error: `Value does not match specified data type: ${setting.dataType}`
        });
        continue;
      }
      
      // Store previous value for audit log
      const previousValue = setting.value;
      
      // Update setting
      setting.value = settingData.value;
      setting.updatedBy = req.user.id;
      setting.updatedAt = Date.now();
      
      await setting.save();
      
      // Create audit log entry
      await SettingAuditLog.create({
        setting: setting._id,
        settingKey: setting.key,
        action: 'UPDATE',
        previousValue,
        newValue: setting.value,
        user: req.user.id,
        userIp: req.ip,
        userAgent: req.headers['user-agent']
      });
      
      // Add to success results
      results.success.push({
        key: setting.key,
        id: setting._id
      });
      
    } catch (err) {
      results.failed.push({
        key: settingData.key || 'unknown',
        error: err.message
      });
    }
  }
  
  // Log the action
  await auditLogger.log({
    user: req.user.id,
    action: 'UPDATE',
    resourceType: 'SETTINGS',
    description: `Bulk updated ${results.success.length} settings`,
    req
  });
  
  res.status(200).json({
    success: true,
    data: results
  });
});

// Helper function to validate setting value against data type
const validateSettingValue = (value, dataType) => {
  switch (dataType) {
    case 'string':
      return typeof value === 'string';
    case 'number':
      return typeof value === 'number' && !isNaN(value);
    case 'boolean':
      return typeof value === 'boolean';
    case 'object':
      return typeof value === 'object' && value !== null && !Array.isArray(value);
    case 'array':
      return Array.isArray(value);
    case 'date':
      return !isNaN(Date.parse(value));
    default:
      return false;
  }
};
