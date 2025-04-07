const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Location = require('../models/Location');
const auditLogger = require('../utils/auditLogger');

// @desc      Get all locations
// @route     GET /api/v1/locations
// @access    Private
exports.getLocations = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc      Get single location
// @route     GET /api/v1/locations/:id
// @access    Private
exports.getLocation = asyncHandler(async (req, res, next) => {
  const location = await Location.findById(req.params.id)
    .populate({
      path: 'createdBy',
      select: 'firstName lastName'
    })
    .populate({
      path: 'updatedBy',
      select: 'firstName lastName'
    });

  if (!location) {
    return next(
      new ErrorResponse(`Location not found with id of ${req.params.id}`, 404)
    );
  }

  // Log the access
  await auditLogger.log({
    user: req.user.id,
    action: 'READ',
    resourceType: 'LOCATION',
    resourceId: location._id,
    description: `Accessed location: ${location.name}`,
    req
  });

  res.status(200).json({
    success: true,
    data: location
  });
});

// @desc      Create new location
// @route     POST /api/v1/locations
// @access    Private (Admin only)
exports.createLocation = asyncHandler(async (req, res, next) => {
  // Add user to request body
  req.body.createdBy = req.user.id;
  req.body.updatedBy = req.user.id;

  // If this is the first location, make it primary
  const locationCount = await Location.countDocuments();
  if (locationCount === 0) {
    req.body.isPrimary = true;
  }

  const location = await Location.create(req.body);

  // Log the action
  await auditLogger.log({
    user: req.user.id,
    action: 'CREATE',
    resourceType: 'LOCATION',
    resourceId: location._id,
    description: `Created location: ${location.name}`,
    req
  });

  res.status(201).json({
    success: true,
    data: location
  });
});

// @desc      Update location
// @route     PUT /api/v1/locations/:id
// @access    Private (Admin only)
exports.updateLocation = asyncHandler(async (req, res, next) => {
  let location = await Location.findById(req.params.id);

  if (!location) {
    return next(
      new ErrorResponse(`Location not found with id of ${req.params.id}`, 404)
    );
  }

  // Add user to request body
  req.body.updatedBy = req.user.id;

  // If setting as primary, ensure we handle the change properly
  if (req.body.isPrimary === true) {
    // This will be handled by the pre-save middleware in the model
  }

  location = await Location.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  // Log the action
  await auditLogger.log({
    user: req.user.id,
    action: 'UPDATE',
    resourceType: 'LOCATION',
    resourceId: location._id,
    description: `Updated location: ${location.name}`,
    req
  });

  res.status(200).json({
    success: true,
    data: location
  });
});

// @desc      Delete location
// @route     DELETE /api/v1/locations/:id
// @access    Private (Admin only)
exports.deleteLocation = asyncHandler(async (req, res, next) => {
  const location = await Location.findById(req.params.id);

  if (!location) {
    return next(
      new ErrorResponse(`Location not found with id of ${req.params.id}`, 404)
    );
  }

  // Check if this is the primary location
  if (location.isPrimary) {
    return next(
      new ErrorResponse(`Cannot delete the primary location. Please set another location as primary first.`, 400)
    );
  }

  // Check if this is the only location
  const locationCount = await Location.countDocuments();
  if (locationCount === 1) {
    return next(
      new ErrorResponse(`Cannot delete the only location. Please create another location first.`, 400)
    );
  }

  await location.remove();

  // Log the action
  await auditLogger.log({
    user: req.user.id,
    action: 'DELETE',
    resourceType: 'LOCATION',
    resourceId: location._id,
    description: `Deleted location: ${location.name}`,
    req
  });

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc      Set location as primary
// @route     PUT /api/v1/locations/:id/set-primary
// @access    Private (Admin only)
exports.setLocationAsPrimary = asyncHandler(async (req, res, next) => {
  let location = await Location.findById(req.params.id);

  if (!location) {
    return next(
      new ErrorResponse(`Location not found with id of ${req.params.id}`, 404)
    );
  }

  // If already primary, no need to update
  if (location.isPrimary) {
    return res.status(200).json({
      success: true,
      data: location,
      message: 'Location is already set as primary'
    });
  }

  // Update the location to be primary
  location.isPrimary = true;
  location.updatedBy = req.user.id;
  location.updatedAt = Date.now();

  await location.save();

  // Log the action
  await auditLogger.log({
    user: req.user.id,
    action: 'UPDATE',
    resourceType: 'LOCATION',
    resourceId: location._id,
    description: `Set location as primary: ${location.name}`,
    req
  });

  res.status(200).json({
    success: true,
    data: location
  });
});

// @desc      Get primary location
// @route     GET /api/v1/locations/primary
// @access    Private
exports.getPrimaryLocation = asyncHandler(async (req, res, next) => {
  const location = await Location.findOne({ isPrimary: true })
    .populate({
      path: 'createdBy',
      select: 'firstName lastName'
    })
    .populate({
      path: 'updatedBy',
      select: 'firstName lastName'
    });

  if (!location) {
    return next(
      new ErrorResponse('No primary location found', 404)
    );
  }

  // Log the access
  await auditLogger.log({
    user: req.user.id,
    action: 'READ',
    resourceType: 'LOCATION',
    resourceId: location._id,
    description: `Accessed primary location: ${location.name}`,
    req
  });

  res.status(200).json({
    success: true,
    data: location
  });
});

// @desc      Update location operating hours
// @route     PUT /api/v1/locations/:id/operating-hours
// @access    Private (Admin only)
exports.updateOperatingHours = asyncHandler(async (req, res, next) => {
  let location = await Location.findById(req.params.id);

  if (!location) {
    return next(
      new ErrorResponse(`Location not found with id of ${req.params.id}`, 404)
    );
  }

  // Validate operating hours
  if (!req.body.operatingHours || !Array.isArray(req.body.operatingHours)) {
    return next(
      new ErrorResponse('Please provide valid operating hours array', 400)
    );
  }

  // Validate each day's hours
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

  for (const hours of req.body.operatingHours) {
    if (!days.includes(hours.day)) {
      return next(
        new ErrorResponse(`Invalid day: ${hours.day}`, 400)
      );
    }

    if (!hours.isClosed) {
      if (!hours.openTime || !timeRegex.test(hours.openTime)) {
        return next(
          new ErrorResponse(`Invalid open time for ${hours.day}`, 400)
        );
      }

      if (!hours.closeTime || !timeRegex.test(hours.closeTime)) {
        return next(
          new ErrorResponse(`Invalid close time for ${hours.day}`, 400)
        );
      }
    }
  }

  // Update operating hours
  location.operatingHours = req.body.operatingHours;
  location.updatedBy = req.user.id;
  location.updatedAt = Date.now();

  await location.save();

  // Log the action
  await auditLogger.log({
    user: req.user.id,
    action: 'UPDATE',
    resourceType: 'LOCATION',
    resourceId: location._id,
    description: `Updated operating hours for location: ${location.name}`,
    req
  });

  res.status(200).json({
    success: true,
    data: location
  });
});
