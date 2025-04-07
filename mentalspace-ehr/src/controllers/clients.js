const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Client = require('../models/Client');
const auditLogger = require('../utils/auditLogger');

// @desc      Get all clients
// @route     GET /api/v1/clients
// @access    Private
exports.getClients = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc      Get single client
// @route     GET /api/v1/clients/:id
// @access    Private
exports.getClient = asyncHandler(async (req, res, next) => {
  const client = await Client.findById(req.params.id);

  if (!client) {
    return next(
      new ErrorResponse(`Client not found with id of ${req.params.id}`, 404)
    );
  }

  // Log the access
  await auditLogger.log({
    user: req.user.id,
    action: 'READ',
    resourceType: 'CLIENT',
    resourceId: client._id,
    description: `Accessed client record: ${client.firstName} ${client.lastName}`,
    req
  });

  res.status(200).json({
    success: true,
    data: client
  });
});

// @desc      Create client
// @route     POST /api/v1/clients
// @access    Private
exports.createClient = asyncHandler(async (req, res, next) => {
  const client = await Client.create(req.body);

  // Log the action
  await auditLogger.log({
    user: req.user.id,
    action: 'CREATE',
    resourceType: 'CLIENT',
    resourceId: client._id,
    description: `Created client record: ${client.firstName} ${client.lastName}`,
    req
  });

  res.status(201).json({
    success: true,
    data: client
  });
});

// @desc      Update client
// @route     PUT /api/v1/clients/:id
// @access    Private
exports.updateClient = asyncHandler(async (req, res, next) => {
  let client = await Client.findById(req.params.id);

  if (!client) {
    return next(
      new ErrorResponse(`Client not found with id of ${req.params.id}`, 404)
    );
  }

  client = await Client.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  // Log the action
  await auditLogger.log({
    user: req.user.id,
    action: 'UPDATE',
    resourceType: 'CLIENT',
    resourceId: client._id,
    description: `Updated client record: ${client.firstName} ${client.lastName}`,
    req
  });

  res.status(200).json({
    success: true,
    data: client
  });
});

// @desc      Delete client
// @route     DELETE /api/v1/clients/:id
// @access    Private/Admin
exports.deleteClient = asyncHandler(async (req, res, next) => {
  const client = await Client.findById(req.params.id);

  if (!client) {
    return next(
      new ErrorResponse(`Client not found with id of ${req.params.id}`, 404)
    );
  }

  // Soft delete by changing status to 'Inactive'
  await Client.findByIdAndUpdate(req.params.id, { status: 'Inactive' });

  // Log the action
  await auditLogger.log({
    user: req.user.id,
    action: 'DELETE',
    resourceType: 'CLIENT',
    resourceId: client._id,
    description: `Deactivated client record: ${client.firstName} ${client.lastName}`,
    req
  });

  res.status(200).json({
    success: true,
    data: {}
  });
});
