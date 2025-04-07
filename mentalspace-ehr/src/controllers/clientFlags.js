const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const ClientFlag = require('../models/ClientFlag');
const Client = require('../models/Client');
const auditLogger = require('../utils/auditLogger');

// @desc      Get all client flags
// @route     GET /api/v1/client-flags
// @access    Private
exports.getClientFlags = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc      Get flags for a specific client
// @route     GET /api/v1/clients/:clientId/flags
// @access    Private
exports.getClientFlagsForClient = asyncHandler(async (req, res, next) => {
  const flags = await ClientFlag.find({ client: req.params.clientId })
    .populate({
      path: 'createdBy',
      select: 'firstName lastName'
    })
    .populate({
      path: 'assignedTo',
      select: 'firstName lastName'
    })
    .sort({ severity: -1, createdAt: -1 });

  // Log the access
  await auditLogger.log({
    user: req.user.id,
    action: 'READ',
    resourceType: 'CLIENT',
    description: `Accessed flags for client ID: ${req.params.clientId}`,
    req
  });

  res.status(200).json({
    success: true,
    count: flags.length,
    data: flags
  });
});

// @desc      Get single client flag
// @route     GET /api/v1/client-flags/:id
// @access    Private
exports.getClientFlag = asyncHandler(async (req, res, next) => {
  const flag = await ClientFlag.findById(req.params.id)
    .populate({
      path: 'client',
      select: 'firstName lastName'
    })
    .populate({
      path: 'createdBy',
      select: 'firstName lastName'
    })
    .populate({
      path: 'assignedTo',
      select: 'firstName lastName'
    });

  if (!flag) {
    return next(
      new ErrorResponse(`Client flag not found with id of ${req.params.id}`, 404)
    );
  }

  // Log the access
  await auditLogger.log({
    user: req.user.id,
    action: 'READ',
    resourceType: 'CLIENT',
    resourceId: flag.client._id,
    description: `Accessed flag for client: ${flag.client.firstName} ${flag.client.lastName}`,
    req
  });

  res.status(200).json({
    success: true,
    data: flag
  });
});

// @desc      Create client flag
// @route     POST /api/v1/clients/:clientId/flags
// @access    Private
exports.createClientFlag = asyncHandler(async (req, res, next) => {
  // Check if client exists
  const client = await Client.findById(req.params.clientId);

  if (!client) {
    return next(
      new ErrorResponse(`Client not found with id of ${req.params.clientId}`, 404)
    );
  }

  // Add client to request body
  req.body.client = req.params.clientId;
  
  // Add creator to request body
  req.body.createdBy = req.user.id;
  req.body.updatedBy = req.user.id;

  const flag = await ClientFlag.create(req.body);

  // Log the action
  await auditLogger.log({
    user: req.user.id,
    action: 'CREATE',
    resourceType: 'CLIENT',
    resourceId: client._id,
    description: `Created flag for client: ${client.firstName} ${client.lastName}`,
    req
  });

  res.status(201).json({
    success: true,
    data: flag
  });
});

// @desc      Update client flag
// @route     PUT /api/v1/client-flags/:id
// @access    Private
exports.updateClientFlag = asyncHandler(async (req, res, next) => {
  let flag = await ClientFlag.findById(req.params.id);

  if (!flag) {
    return next(
      new ErrorResponse(`Client flag not found with id of ${req.params.id}`, 404)
    );
  }

  // Add updater to request body
  req.body.updatedBy = req.user.id;

  // If status is changing to Resolved, add resolution date if not provided
  if (req.body.status === 'Resolved' && flag.status !== 'Resolved') {
    req.body.resolvedDate = Date.now();
    req.body.resolvedBy = req.user.id;
  }

  flag = await ClientFlag.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  // Log the action
  await auditLogger.log({
    user: req.user.id,
    action: 'UPDATE',
    resourceType: 'CLIENT',
    resourceId: flag.client,
    description: `Updated flag ID: ${flag._id}`,
    req
  });

  res.status(200).json({
    success: true,
    data: flag
  });
});

// @desc      Delete client flag
// @route     DELETE /api/v1/client-flags/:id
// @access    Private
exports.deleteClientFlag = asyncHandler(async (req, res, next) => {
  const flag = await ClientFlag.findById(req.params.id);

  if (!flag) {
    return next(
      new ErrorResponse(`Client flag not found with id of ${req.params.id}`, 404)
    );
  }

  // Check if user is authorized to delete this flag
  if (
    flag.createdBy.toString() !== req.user.id &&
    req.user.role !== 'PRACTICE_ADMIN' &&
    req.user.role !== 'SUPERVISOR'
  ) {
    return next(
      new ErrorResponse(`Not authorized to delete this flag`, 403)
    );
  }

  await flag.remove();

  // Log the action
  await auditLogger.log({
    user: req.user.id,
    action: 'DELETE',
    resourceType: 'CLIENT',
    resourceId: flag.client,
    description: `Deleted flag ID: ${flag._id}`,
    req
  });

  res.status(200).json({
    success: true,
    data: {}
  });
});
