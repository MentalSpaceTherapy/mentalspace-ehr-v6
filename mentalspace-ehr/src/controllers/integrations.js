const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Integration = require('../models/Integration');
const auditLogger = require('../utils/auditLogger');

// @desc      Get all integrations
// @route     GET /api/v1/integrations
// @access    Private
exports.getIntegrations = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc      Get single integration
// @route     GET /api/v1/integrations/:id
// @access    Private
exports.getIntegration = asyncHandler(async (req, res, next) => {
  const integration = await Integration.findById(req.params.id)
    .populate({
      path: 'createdBy',
      select: 'firstName lastName'
    })
    .populate({
      path: 'updatedBy',
      select: 'firstName lastName'
    });

  if (!integration) {
    return next(
      new ErrorResponse(`Integration not found with id of ${req.params.id}`, 404)
    );
  }

  // Log the access
  await auditLogger.log({
    user: req.user.id,
    action: 'READ',
    resourceType: 'INTEGRATION',
    resourceId: integration._id,
    description: `Accessed integration: ${integration.name}`,
    req
  });

  res.status(200).json({
    success: true,
    data: integration
  });
});

// @desc      Create new integration
// @route     POST /api/v1/integrations
// @access    Private (Admin only)
exports.createIntegration = asyncHandler(async (req, res, next) => {
  // Add user to request body
  req.body.createdBy = req.user.id;
  req.body.updatedBy = req.user.id;

  const integration = await Integration.create(req.body);

  // Log the action
  await auditLogger.log({
    user: req.user.id,
    action: 'CREATE',
    resourceType: 'INTEGRATION',
    resourceId: integration._id,
    description: `Created integration: ${integration.name}`,
    req
  });

  res.status(201).json({
    success: true,
    data: integration
  });
});

// @desc      Update integration
// @route     PUT /api/v1/integrations/:id
// @access    Private (Admin only)
exports.updateIntegration = asyncHandler(async (req, res, next) => {
  let integration = await Integration.findById(req.params.id);

  if (!integration) {
    return next(
      new ErrorResponse(`Integration not found with id of ${req.params.id}`, 404)
    );
  }

  // Add user to request body
  req.body.updatedBy = req.user.id;

  integration = await Integration.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  // Log the action
  await auditLogger.log({
    user: req.user.id,
    action: 'UPDATE',
    resourceType: 'INTEGRATION',
    resourceId: integration._id,
    description: `Updated integration: ${integration.name}`,
    req
  });

  res.status(200).json({
    success: true,
    data: integration
  });
});

// @desc      Delete integration
// @route     DELETE /api/v1/integrations/:id
// @access    Private (Admin only)
exports.deleteIntegration = asyncHandler(async (req, res, next) => {
  const integration = await Integration.findById(req.params.id);

  if (!integration) {
    return next(
      new ErrorResponse(`Integration not found with id of ${req.params.id}`, 404)
    );
  }

  // Check if integration is active
  if (integration.status === 'Active') {
    return next(
      new ErrorResponse(`Cannot delete an active integration. Please deactivate it first.`, 400)
    );
  }

  await integration.remove();

  // Log the action
  await auditLogger.log({
    user: req.user.id,
    action: 'DELETE',
    resourceType: 'INTEGRATION',
    resourceId: integration._id,
    description: `Deleted integration: ${integration.name}`,
    req
  });

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc      Activate integration
// @route     PUT /api/v1/integrations/:id/activate
// @access    Private (Admin only)
exports.activateIntegration = asyncHandler(async (req, res, next) => {
  let integration = await Integration.findById(req.params.id);

  if (!integration) {
    return next(
      new ErrorResponse(`Integration not found with id of ${req.params.id}`, 404)
    );
  }

  // Check if already active
  if (integration.status === 'Active') {
    return res.status(200).json({
      success: true,
      data: integration,
      message: 'Integration is already active'
    });
  }

  // Validate required credentials based on integration type
  const missingCredentials = validateIntegrationCredentials(integration);
  if (missingCredentials.length > 0) {
    return next(
      new ErrorResponse(`Missing required credentials: ${missingCredentials.join(', ')}`, 400)
    );
  }

  // Update integration status
  integration.status = 'Active';
  integration.updatedBy = req.user.id;
  integration.updatedAt = Date.now();

  // Clear any previous errors
  integration.lastError = undefined;

  await integration.save();

  // Log the action
  await auditLogger.log({
    user: req.user.id,
    action: 'UPDATE',
    resourceType: 'INTEGRATION',
    resourceId: integration._id,
    description: `Activated integration: ${integration.name}`,
    req
  });

  res.status(200).json({
    success: true,
    data: integration
  });
});

// @desc      Deactivate integration
// @route     PUT /api/v1/integrations/:id/deactivate
// @access    Private (Admin only)
exports.deactivateIntegration = asyncHandler(async (req, res, next) => {
  let integration = await Integration.findById(req.params.id);

  if (!integration) {
    return next(
      new ErrorResponse(`Integration not found with id of ${req.params.id}`, 404)
    );
  }

  // Check if already inactive
  if (integration.status === 'Inactive') {
    return res.status(200).json({
      success: true,
      data: integration,
      message: 'Integration is already inactive'
    });
  }

  // Update integration status
  integration.status = 'Inactive';
  integration.updatedBy = req.user.id;
  integration.updatedAt = Date.now();

  await integration.save();

  // Log the action
  await auditLogger.log({
    user: req.user.id,
    action: 'UPDATE',
    resourceType: 'INTEGRATION',
    resourceId: integration._id,
    description: `Deactivated integration: ${integration.name}`,
    req
  });

  res.status(200).json({
    success: true,
    data: integration
  });
});

// @desc      Test integration connection
// @route     POST /api/v1/integrations/:id/test
// @access    Private (Admin only)
exports.testIntegration = asyncHandler(async (req, res, next) => {
  let integration = await Integration.findById(req.params.id);

  if (!integration) {
    return next(
      new ErrorResponse(`Integration not found with id of ${req.params.id}`, 404)
    );
  }

  // Validate required credentials based on integration type
  const missingCredentials = validateIntegrationCredentials(integration);
  if (missingCredentials.length > 0) {
    return next(
      new ErrorResponse(`Missing required credentials: ${missingCredentials.join(', ')}`, 400)
    );
  }

  // In a real implementation, this would actually test the connection
  // For this demo, we'll simulate a successful test
  const testResult = {
    success: true,
    message: 'Connection test successful',
    timestamp: new Date(),
    details: {
      responseTime: '120ms',
      apiVersion: '2.0',
      provider: integration.provider
    }
  };

  // Log the action
  await auditLogger.log({
    user: req.user.id,
    action: 'TEST',
    resourceType: 'INTEGRATION',
    resourceId: integration._id,
    description: `Tested integration connection: ${integration.name}`,
    req
  });

  res.status(200).json({
    success: true,
    data: testResult
  });
});

// @desc      Sync integration data
// @route     POST /api/v1/integrations/:id/sync
// @access    Private (Admin only)
exports.syncIntegration = asyncHandler(async (req, res, next) => {
  let integration = await Integration.findById(req.params.id);

  if (!integration) {
    return next(
      new ErrorResponse(`Integration not found with id of ${req.params.id}`, 404)
    );
  }

  // Check if integration is active
  if (integration.status !== 'Active') {
    return next(
      new ErrorResponse(`Cannot sync an inactive integration. Please activate it first.`, 400)
    );
  }

  // In a real implementation, this would trigger a sync process
  // For this demo, we'll simulate a successful sync
  
  // Update sync timestamps
  integration.syncSettings.lastSyncAt = Date.now();
  
  // Calculate next sync time based on frequency
  const nextSyncAt = new Date();
  switch (integration.syncSettings.syncFrequency) {
    case 'Hourly':
      nextSyncAt.setHours(nextSyncAt.getHours() + 1);
      break;
    case 'Daily':
      nextSyncAt.setDate(nextSyncAt.getDate() + 1);
      break;
    case 'Weekly':
      nextSyncAt.setDate(nextSyncAt.getDate() + 7);
      break;
    case 'Monthly':
      nextSyncAt.setMonth(nextSyncAt.getMonth() + 1);
      break;
    case 'Custom':
      nextSyncAt.setMinutes(nextSyncAt.getMinutes() + integration.syncSettings.customSyncInterval);
      break;
    default:
      nextSyncAt.setDate(nextSyncAt.getDate() + 1);
  }
  
  integration.syncSettings.nextSyncAt = nextSyncAt;
  integration.updatedBy = req.user.id;
  integration.updatedAt = Date.now();
  
  await integration.save();

  // Log the action
  await auditLogger.log({
    user: req.user.id,
    action: 'SYNC',
    resourceType: 'INTEGRATION',
    resourceId: integration._id,
    description: `Triggered sync for integration: ${integration.name}`,
    req
  });

  res.status(200).json({
    success: true,
    data: {
      message: 'Sync process initiated successfully',
      lastSyncAt: integration.syncSettings.lastSyncAt,
      nextSyncAt: integration.syncSettings.nextSyncAt
    }
  });
});

// @desc      Get integrations by type
// @route     GET /api/v1/integrations/type/:type
// @access    Private
exports.getIntegrationsByType = asyncHandler(async (req, res, next) => {
  const { type } = req.params;
  
  // Validate integration type
  const validTypes = [
    'EHR',
    'Billing',
    'Insurance',
    'Telehealth',
    'Scheduling',
    'Messaging',
    'Payment',
    'Analytics',
    'CRM',
    'Email',
    'SMS',
    'Calendar',
    'Other'
  ];
  
  if (!validTypes.includes(type)) {
    return next(
      new ErrorResponse(`Invalid integration type: ${type}`, 400)
    );
  }
  
  const integrations = await Integration.find({ type })
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
    resourceType: 'INTEGRATION',
    description: `Accessed ${type} integrations`,
    req
  });
  
  res.status(200).json({
    success: true,
    count: integrations.length,
    data: integrations
  });
});

// Helper function to validate integration credentials
const validateIntegrationCredentials = (integration) => {
  const missingCredentials = [];
  
  switch (integration.type) {
    case 'EHR':
    case 'Billing':
    case 'Insurance':
      // These typically require API keys
      if (!integration.credentials.apiKey) {
        missingCredentials.push('API Key');
      }
      if (!integration.credentials.apiSecret) {
        missingCredentials.push('API Secret');
      }
      break;
      
    case 'Telehealth':
    case 'Messaging':
      // These often use OAuth
      if (!integration.credentials.clientId) {
        missingCredentials.push('Client ID');
      }
      if (!integration.credentials.clientSecret) {
        missingCredentials.push('Client Secret');
      }
      break;
      
    case 'Email':
    case 'SMS':
      // These might use username/password or API keys
      if (!integration.credentials.username && !integration.credentials.apiKey) {
        missingCredentials.push('Username or API Key');
      }
      if (!integration.credentials.password && !integration.credentials.apiSecret) {
        missingCredentials.push('Password or API Secret');
      }
      break;
      
    case 'Calendar':
      // These often use OAuth
      if (!integration.credentials.accessToken) {
        missingCredentials.push('Access Token');
      }
      break;
      
    default:
      // For other types, at least one credential should be present
      if (Object.keys(integration.credentials).length === 0) {
        missingCredentials.push('At least one credential');
      }
  }
  
  // Base URL is required for most integrations
  if (!integration.credentials.baseUrl) {
    missingCredentials.push('Base URL');
  }
  
  return missingCredentials;
};
