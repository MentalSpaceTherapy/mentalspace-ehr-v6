const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Staff = require('../models/Staff');
const auditLogger = require('../utils/auditLogger');

// @desc      Get all staff
// @route     GET /api/v1/staff
// @access    Private
exports.getStaffs = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc      Get single staff
// @route     GET /api/v1/staff/:id
// @access    Private
exports.getStaff = asyncHandler(async (req, res, next) => {
  const staff = await Staff.findById(req.params.id);

  if (!staff) {
    return next(
      new ErrorResponse(`Staff not found with id of ${req.params.id}`, 404)
    );
  }

  // Log the access
  await auditLogger.log({
    user: req.user.id,
    action: 'READ',
    resourceType: 'STAFF',
    resourceId: staff._id,
    description: `Accessed staff record: ${staff.firstName} ${staff.lastName}`,
    req
  });

  res.status(200).json({
    success: true,
    data: staff
  });
});

// @desc      Create staff
// @route     POST /api/v1/staff
// @access    Private/Admin
exports.createStaff = asyncHandler(async (req, res, next) => {
  const staff = await Staff.create(req.body);

  // Log the action
  await auditLogger.log({
    user: req.user.id,
    action: 'CREATE',
    resourceType: 'STAFF',
    resourceId: staff._id,
    description: `Created staff record: ${staff.firstName} ${staff.lastName}`,
    req
  });

  res.status(201).json({
    success: true,
    data: staff
  });
});

// @desc      Update staff
// @route     PUT /api/v1/staff/:id
// @access    Private/Admin
exports.updateStaff = asyncHandler(async (req, res, next) => {
  let staff = await Staff.findById(req.params.id);

  if (!staff) {
    return next(
      new ErrorResponse(`Staff not found with id of ${req.params.id}`, 404)
    );
  }

  staff = await Staff.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  // Log the action
  await auditLogger.log({
    user: req.user.id,
    action: 'UPDATE',
    resourceType: 'STAFF',
    resourceId: staff._id,
    description: `Updated staff record: ${staff.firstName} ${staff.lastName}`,
    req
  });

  res.status(200).json({
    success: true,
    data: staff
  });
});

// @desc      Delete staff
// @route     DELETE /api/v1/staff/:id
// @access    Private/Admin
exports.deleteStaff = asyncHandler(async (req, res, next) => {
  const staff = await Staff.findById(req.params.id);

  if (!staff) {
    return next(
      new ErrorResponse(`Staff not found with id of ${req.params.id}`, 404)
    );
  }

  await Staff.findByIdAndUpdate(req.params.id, { isActive: false });

  // Log the action
  await auditLogger.log({
    user: req.user.id,
    action: 'DELETE',
    resourceType: 'STAFF',
    resourceId: staff._id,
    description: `Deactivated staff record: ${staff.firstName} ${staff.lastName}`,
    req
  });

  res.status(200).json({
    success: true,
    data: {}
  });
});
