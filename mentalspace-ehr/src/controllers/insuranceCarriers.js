const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const InsuranceCarrier = require('../models/InsuranceCarrier');
const auditLogger = require('../utils/auditLogger');

// @desc      Get all insurance carriers
// @route     GET /api/v1/insurance-carriers
// @access    Private
exports.getInsuranceCarriers = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc      Get single insurance carrier
// @route     GET /api/v1/insurance-carriers/:id
// @access    Private
exports.getInsuranceCarrier = asyncHandler(async (req, res, next) => {
  const carrier = await InsuranceCarrier.findById(req.params.id);

  if (!carrier) {
    return next(
      new ErrorResponse(`Insurance carrier not found with id of ${req.params.id}`, 404)
    );
  }

  // Log the access
  await auditLogger.log({
    user: req.user.id,
    action: 'READ',
    resourceType: 'BILLING',
    resourceId: carrier._id,
    description: `Accessed insurance carrier: ${carrier.name}`,
    req
  });

  res.status(200).json({
    success: true,
    data: carrier
  });
});

// @desc      Create insurance carrier
// @route     POST /api/v1/insurance-carriers
// @access    Private
exports.createInsuranceCarrier = asyncHandler(async (req, res, next) => {
  // Add creator to request body
  req.body.createdBy = req.user.id;
  req.body.updatedBy = req.user.id;

  const carrier = await InsuranceCarrier.create(req.body);

  // Log the action
  await auditLogger.log({
    user: req.user.id,
    action: 'CREATE',
    resourceType: 'BILLING',
    resourceId: carrier._id,
    description: `Created insurance carrier: ${carrier.name}`,
    req
  });

  res.status(201).json({
    success: true,
    data: carrier
  });
});

// @desc      Update insurance carrier
// @route     PUT /api/v1/insurance-carriers/:id
// @access    Private
exports.updateInsuranceCarrier = asyncHandler(async (req, res, next) => {
  let carrier = await InsuranceCarrier.findById(req.params.id);

  if (!carrier) {
    return next(
      new ErrorResponse(`Insurance carrier not found with id of ${req.params.id}`, 404)
    );
  }

  // Add updater to request body
  req.body.updatedBy = req.user.id;

  carrier = await InsuranceCarrier.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  // Log the action
  await auditLogger.log({
    user: req.user.id,
    action: 'UPDATE',
    resourceType: 'BILLING',
    resourceId: carrier._id,
    description: `Updated insurance carrier: ${carrier.name}`,
    req
  });

  res.status(200).json({
    success: true,
    data: carrier
  });
});

// @desc      Delete insurance carrier
// @route     DELETE /api/v1/insurance-carriers/:id
// @access    Private
exports.deleteInsuranceCarrier = asyncHandler(async (req, res, next) => {
  const carrier = await InsuranceCarrier.findById(req.params.id);

  if (!carrier) {
    return next(
      new ErrorResponse(`Insurance carrier not found with id of ${req.params.id}`, 404)
    );
  }

  // Instead of deleting, mark as inactive
  carrier.isActive = false;
  carrier.updatedBy = req.user.id;
  await carrier.save();

  // Log the action
  await auditLogger.log({
    user: req.user.id,
    action: 'UPDATE',
    resourceType: 'BILLING',
    resourceId: carrier._id,
    description: `Marked insurance carrier as inactive: ${carrier.name}`,
    req
  });

  res.status(200).json({
    success: true,
    data: {}
  });
});
