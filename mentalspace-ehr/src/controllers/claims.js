const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Claim = require('../models/Claim');
const Client = require('../models/Client');
const Staff = require('../models/Staff');
const InsurancePolicy = require('../models/InsurancePolicy');
const InsuranceCarrier = require('../models/InsuranceCarrier');
const auditLogger = require('../utils/auditLogger');

// @desc      Get all claims
// @route     GET /api/v1/claims
// @access    Private
exports.getClaims = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc      Get claims for a specific client
// @route     GET /api/v1/clients/:clientId/claims
// @access    Private
exports.getClientClaims = asyncHandler(async (req, res, next) => {
  const claims = await Claim.find({ client: req.params.clientId })
    .populate({
      path: 'provider',
      select: 'firstName lastName'
    })
    .populate({
      path: 'insuranceCarrier',
      select: 'name'
    })
    .populate({
      path: 'insurancePolicy',
      select: 'policyNumber'
    })
    .sort({ serviceDate: -1 });

  // Log the access
  await auditLogger.log({
    user: req.user.id,
    action: 'READ',
    resourceType: 'BILLING',
    description: `Accessed claims for client ID: ${req.params.clientId}`,
    req
  });

  res.status(200).json({
    success: true,
    count: claims.length,
    data: claims
  });
});

// @desc      Get single claim
// @route     GET /api/v1/claims/:id
// @access    Private
exports.getClaim = asyncHandler(async (req, res, next) => {
  const claim = await Claim.findById(req.params.id)
    .populate({
      path: 'client',
      select: 'firstName lastName dateOfBirth'
    })
    .populate({
      path: 'provider',
      select: 'firstName lastName'
    })
    .populate({
      path: 'appointment',
      select: 'startTime endTime appointmentType'
    })
    .populate({
      path: 'note',
      select: 'noteType title'
    })
    .populate({
      path: 'insurancePolicy',
      select: 'policyNumber policyHolder'
    })
    .populate({
      path: 'insuranceCarrier',
      select: 'name payerId'
    })
    .populate({
      path: 'authorization',
      select: 'authorizationNumber totalSessions sessionsUsed'
    })
    .populate({
      path: 'payments',
      select: 'amount date paymentType paymentMethod'
    });

  if (!claim) {
    return next(
      new ErrorResponse(`Claim not found with id of ${req.params.id}`, 404)
    );
  }

  // Log the access
  await auditLogger.log({
    user: req.user.id,
    action: 'READ',
    resourceType: 'BILLING',
    resourceId: claim._id,
    description: `Accessed claim ID: ${claim._id}`,
    req
  });

  res.status(200).json({
    success: true,
    data: claim
  });
});

// @desc      Create claim
// @route     POST /api/v1/claims
// @access    Private
exports.createClaim = asyncHandler(async (req, res, next) => {
  // Check if client exists
  const client = await Client.findById(req.body.client);
  if (!client) {
    return next(
      new ErrorResponse(`Client not found with id of ${req.body.client}`, 404)
    );
  }

  // Check if provider exists
  const provider = await Staff.findById(req.body.provider);
  if (!provider) {
    return next(
      new ErrorResponse(`Provider not found with id of ${req.body.provider}`, 404)
    );
  }

  // Check if insurance policy exists
  const policy = await InsurancePolicy.findById(req.body.insurancePolicy);
  if (!policy) {
    return next(
      new ErrorResponse(`Insurance policy not found with id of ${req.body.insurancePolicy}`, 404)
    );
  }

  // Check if insurance carrier exists
  const carrier = await InsuranceCarrier.findById(req.body.insuranceCarrier);
  if (!carrier) {
    return next(
      new ErrorResponse(`Insurance carrier not found with id of ${req.body.insuranceCarrier}`, 404)
    );
  }

  // Add creator to request body
  req.body.createdBy = req.user.id;
  req.body.updatedBy = req.user.id;

  const claim = await Claim.create(req.body);

  // Log the action
  await auditLogger.log({
    user: req.user.id,
    action: 'CREATE',
    resourceType: 'BILLING',
    resourceId: claim._id,
    description: `Created claim for client: ${client.firstName} ${client.lastName}`,
    req
  });

  res.status(201).json({
    success: true,
    data: claim
  });
});

// @desc      Update claim
// @route     PUT /api/v1/claims/:id
// @access    Private
exports.updateClaim = asyncHandler(async (req, res, next) => {
  let claim = await Claim.findById(req.params.id);

  if (!claim) {
    return next(
      new ErrorResponse(`Claim not found with id of ${req.params.id}`, 404)
    );
  }

  // Add updater to request body
  req.body.updatedBy = req.user.id;

  claim = await Claim.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  // Log the action
  await auditLogger.log({
    user: req.user.id,
    action: 'UPDATE',
    resourceType: 'BILLING',
    resourceId: claim._id,
    description: `Updated claim ID: ${claim._id}`,
    req
  });

  res.status(200).json({
    success: true,
    data: claim
  });
});

// @desc      Delete claim
// @route     DELETE /api/v1/claims/:id
// @access    Private
exports.deleteClaim = asyncHandler(async (req, res, next) => {
  const claim = await Claim.findById(req.params.id);

  if (!claim) {
    return next(
      new ErrorResponse(`Claim not found with id of ${req.params.id}`, 404)
    );
  }

  // Only allow deletion of draft claims
  if (claim.status !== 'Draft') {
    return next(
      new ErrorResponse(`Cannot delete a claim with status: ${claim.status}`, 403)
    );
  }

  await claim.remove();

  // Log the action
  await auditLogger.log({
    user: req.user.id,
    action: 'DELETE',
    resourceType: 'BILLING',
    resourceId: claim._id,
    description: `Deleted claim ID: ${claim._id}`,
    req
  });

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc      Submit claim
// @route     PUT /api/v1/claims/:id/submit
// @access    Private
exports.submitClaim = asyncHandler(async (req, res, next) => {
  let claim = await Claim.findById(req.params.id);

  if (!claim) {
    return next(
      new ErrorResponse(`Claim not found with id of ${req.params.id}`, 404)
    );
  }

  // Check if claim is ready to submit
  if (claim.status !== 'Draft' && claim.status !== 'Ready to Submit') {
    return next(
      new ErrorResponse(`Cannot submit a claim with status: ${claim.status}`, 403)
    );
  }

  // Update claim
  claim = await Claim.findByIdAndUpdate(
    req.params.id,
    {
      status: 'Submitted',
      dateSubmitted: Date.now(),
      submissionMethod: req.body.submissionMethod || claim.submissionMethod,
      submissionNotes: req.body.submissionNotes,
      trackingNumber: req.body.trackingNumber,
      updatedBy: req.user.id,
      updatedAt: Date.now()
    },
    { new: true, runValidators: true }
  );

  // Log the action
  await auditLogger.log({
    user: req.user.id,
    action: 'UPDATE',
    resourceType: 'BILLING',
    resourceId: claim._id,
    description: `Submitted claim ID: ${claim._id}`,
    req
  });

  res.status(200).json({
    success: true,
    data: claim
  });
});

// @desc      Mark claim as denied
// @route     PUT /api/v1/claims/:id/deny
// @access    Private
exports.denyClaim = asyncHandler(async (req, res, next) => {
  let claim = await Claim.findById(req.params.id);

  if (!claim) {
    return next(
      new ErrorResponse(`Claim not found with id of ${req.params.id}`, 404)
    );
  }

  // Check if claim can be marked as denied
  if (claim.status !== 'Submitted' && claim.status !== 'In Process') {
    return next(
      new ErrorResponse(`Cannot mark a claim with status: ${claim.status} as denied`, 403)
    );
  }

  // Update claim
  claim = await Claim.findByIdAndUpdate(
    req.params.id,
    {
      status: 'Denied',
      denialReason: req.body.denialReason,
      updatedBy: req.user.id,
      updatedAt: Date.now()
    },
    { new: true, runValidators: true }
  );

  // Log the action
  await auditLogger.log({
    user: req.user.id,
    action: 'UPDATE',
    resourceType: 'BILLING',
    resourceId: claim._id,
    description: `Marked claim ID: ${claim._id} as denied`,
    req
  });

  res.status(200).json({
    success: true,
    data: claim
  });
});

// @desc      Appeal claim
// @route     PUT /api/v1/claims/:id/appeal
// @access    Private
exports.appealClaim = asyncHandler(async (req, res, next) => {
  let claim = await Claim.findById(req.params.id);

  if (!claim) {
    return next(
      new ErrorResponse(`Claim not found with id of ${req.params.id}`, 404)
    );
  }

  // Check if claim can be appealed
  if (claim.status !== 'Denied') {
    return next(
      new ErrorResponse(`Cannot appeal a claim with status: ${claim.status}`, 403)
    );
  }

  // Update claim
  claim = await Claim.findByIdAndUpdate(
    req.params.id,
    {
      appealStatus: 'Appeal Submitted',
      appealDate: Date.now(),
      appealNotes: req.body.appealNotes,
      updatedBy: req.user.id,
      updatedAt: Date.now()
    },
    { new: true, runValidators: true }
  );

  // Log the action
  await auditLogger.log({
    user: req.user.id,
    action: 'UPDATE',
    resourceType: 'BILLING',
    resourceId: claim._id,
    description: `Appealed claim ID: ${claim._id}`,
    req
  });

  res.status(200).json({
    success: true,
    data: claim
  });
});
