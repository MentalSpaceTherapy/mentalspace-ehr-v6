const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const ProviderAvailability = require('../models/ProviderAvailability');
const Staff = require('../models/Staff');
const auditLogger = require('../utils/auditLogger');

// @desc      Get all provider availabilities
// @route     GET /api/v1/provider-availabilities
// @access    Private
exports.getProviderAvailabilities = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc      Get availabilities for a specific provider
// @route     GET /api/v1/staff/:providerId/availabilities
// @access    Private
exports.getProviderAvailabilitiesForProvider = asyncHandler(async (req, res, next) => {
  const availabilities = await ProviderAvailability.find({ 
    provider: req.params.providerId,
    $or: [
      { endDate: { $exists: false } },
      { endDate: null },
      { endDate: { $gte: new Date() } }
    ]
  }).sort({ dayOfWeek: 1, startTime: 1 });

  // Log the access
  await auditLogger.log({
    user: req.user.id,
    action: 'READ',
    resourceType: 'STAFF',
    description: `Accessed availabilities for provider ID: ${req.params.providerId}`,
    req
  });

  res.status(200).json({
    success: true,
    count: availabilities.length,
    data: availabilities
  });
});

// @desc      Get single provider availability
// @route     GET /api/v1/provider-availabilities/:id
// @access    Private
exports.getProviderAvailability = asyncHandler(async (req, res, next) => {
  const availability = await ProviderAvailability.findById(req.params.id)
    .populate({
      path: 'provider',
      select: 'firstName lastName'
    });

  if (!availability) {
    return next(
      new ErrorResponse(`Provider availability not found with id of ${req.params.id}`, 404)
    );
  }

  // Log the access
  await auditLogger.log({
    user: req.user.id,
    action: 'READ',
    resourceType: 'STAFF',
    resourceId: availability.provider._id,
    description: `Accessed availability for provider: ${availability.provider.firstName} ${availability.provider.lastName}`,
    req
  });

  res.status(200).json({
    success: true,
    data: availability
  });
});

// @desc      Create provider availability
// @route     POST /api/v1/staff/:providerId/availabilities
// @access    Private
exports.createProviderAvailability = asyncHandler(async (req, res, next) => {
  // Check if provider exists
  const provider = await Staff.findById(req.params.providerId);

  if (!provider) {
    return next(
      new ErrorResponse(`Provider not found with id of ${req.params.providerId}`, 404)
    );
  }

  // Add provider to request body
  req.body.provider = req.params.providerId;
  
  // Add creator to request body
  req.body.createdBy = req.user.id;
  req.body.updatedBy = req.user.id;

  const availability = await ProviderAvailability.create(req.body);

  // Log the action
  await auditLogger.log({
    user: req.user.id,
    action: 'CREATE',
    resourceType: 'STAFF',
    resourceId: provider._id,
    description: `Created availability for provider: ${provider.firstName} ${provider.lastName}`,
    req
  });

  res.status(201).json({
    success: true,
    data: availability
  });
});

// @desc      Update provider availability
// @route     PUT /api/v1/provider-availabilities/:id
// @access    Private
exports.updateProviderAvailability = asyncHandler(async (req, res, next) => {
  let availability = await ProviderAvailability.findById(req.params.id);

  if (!availability) {
    return next(
      new ErrorResponse(`Provider availability not found with id of ${req.params.id}`, 404)
    );
  }

  // Add updater to request body
  req.body.updatedBy = req.user.id;

  availability = await ProviderAvailability.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  // Log the action
  await auditLogger.log({
    user: req.user.id,
    action: 'UPDATE',
    resourceType: 'STAFF',
    resourceId: availability.provider,
    description: `Updated availability ID: ${availability._id}`,
    req
  });

  res.status(200).json({
    success: true,
    data: availability
  });
});

// @desc      Delete provider availability
// @route     DELETE /api/v1/provider-availabilities/:id
// @access    Private
exports.deleteProviderAvailability = asyncHandler(async (req, res, next) => {
  const availability = await ProviderAvailability.findById(req.params.id);

  if (!availability) {
    return next(
      new ErrorResponse(`Provider availability not found with id of ${req.params.id}`, 404)
    );
  }

  await availability.remove();

  // Log the action
  await auditLogger.log({
    user: req.user.id,
    action: 'DELETE',
    resourceType: 'STAFF',
    resourceId: availability.provider,
    description: `Deleted availability ID: ${availability._id}`,
    req
  });

  res.status(200).json({
    success: true,
    data: {}
  });
});
