const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Authorization = require('../models/Authorization');
const Client = require('../models/Client');
const InsurancePolicy = require('../models/InsurancePolicy');
const InsuranceCarrier = require('../models/InsuranceCarrier');
const Staff = require('../models/Staff');
const auditLogger = require('../utils/auditLogger');

// @desc      Get all authorizations
// @route     GET /api/v1/authorizations
// @access    Private
exports.getAuthorizations = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc      Get authorizations for a specific client
// @route     GET /api/v1/clients/:clientId/authorizations
// @access    Private
exports.getClientAuthorizations = asyncHandler(async (req, res, next) => {
  const authorizations = await Authorization.find({ client: req.params.clientId })
    .populate({
      path: 'insurancePolicy',
      select: 'policyNumber'
    })
    .populate({
      path: 'insuranceCarrier',
      select: 'name'
    })
    .sort({ startDate: -1 });

  // Log the access
  await auditLogger.log({
    user: req.user.id,
    action: 'READ',
    resourceType: 'BILLING',
    description: `Accessed authorizations for client ID: ${req.params.clientId}`,
    req
  });

  res.status(200).json({
    success: true,
    count: authorizations.length,
    data: authorizations
  });
});

// @desc      Get single authorization
// @route     GET /api/v1/authorizations/:id
// @access    Private
exports.getAuthorization = asyncHandler(async (req, res, next) => {
  const authorization = await Authorization.findById(req.params.id)
    .populate({
      path: 'client',
      select: 'firstName lastName dateOfBirth'
    })
    .populate({
      path: 'insurancePolicy',
      select: 'policyNumber policyHolder'
    })
    .populate({
      path: 'insuranceCarrier',
      select: 'name'
    })
    .populate({
      path: 'approvedProvider',
      select: 'firstName lastName'
    })
    .populate({
      path: 'verifiedBy',
      select: 'firstName lastName'
    });

  if (!authorization) {
    return next(
      new ErrorResponse(`Authorization not found with id of ${req.params.id}`, 404)
    );
  }

  // Log the access
  await auditLogger.log({
    user: req.user.id,
    action: 'READ',
    resourceType: 'BILLING',
    resourceId: authorization._id,
    description: `Accessed authorization ID: ${authorization._id}`,
    req
  });

  res.status(200).json({
    success: true,
    data: authorization
  });
});

// @desc      Create authorization
// @route     POST /api/v1/authorizations
// @access    Private
exports.createAuthorization = asyncHandler(async (req, res, next) => {
  // Check if client exists
  const client = await Client.findById(req.body.client);
  if (!client) {
    return next(
      new ErrorResponse(`Client not found with id of ${req.body.client}`, 404)
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

  // Check if approved provider exists if provided
  if (req.body.approvedProvider) {
    const provider = await Staff.findById(req.body.approvedProvider);
    if (!provider) {
      return next(
        new ErrorResponse(`Provider not found with id of ${req.body.approvedProvider}`, 404)
      );
    }
  }

  // Add creator to request body
  req.body.createdBy = req.user.id;
  req.body.updatedBy = req.user.id;

  const authorization = await Authorization.create(req.body);

  // Log the action
  await auditLogger.log({
    user: req.user.id,
    action: 'CREATE',
    resourceType: 'BILLING',
    resourceId: authorization._id,
    description: `Created authorization for client: ${client.firstName} ${client.lastName}`,
    req
  });

  res.status(201).json({
    success: true,
    data: authorization
  });
});

// @desc      Update authorization
// @route     PUT /api/v1/authorizations/:id
// @access    Private
exports.updateAuthorization = asyncHandler(async (req, res, next) => {
  let authorization = await Authorization.findById(req.params.id);

  if (!authorization) {
    return next(
      new ErrorResponse(`Authorization not found with id of ${req.params.id}`, 404)
    );
  }

  // Add updater to request body
  req.body.updatedBy = req.user.id;

  authorization = await Authorization.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  // Log the action
  await auditLogger.log({
    user: req.user.id,
    action: 'UPDATE',
    resourceType: 'BILLING',
    resourceId: authorization._id,
    description: `Updated authorization ID: ${authorization._id}`,
    req
  });

  res.status(200).json({
    success: true,
    data: authorization
  });
});

// @desc      Delete authorization
// @route     DELETE /api/v1/authorizations/:id
// @access    Private
exports.deleteAuthorization = asyncHandler(async (req, res, next) => {
  const authorization = await Authorization.findById(req.params.id);

  if (!authorization) {
    return next(
      new ErrorResponse(`Authorization not found with id of ${req.params.id}`, 404)
    );
  }

  await authorization.remove();

  // Log the action
  await auditLogger.log({
    user: req.user.id,
    action: 'DELETE',
    resourceType: 'BILLING',
    resourceId: authorization._id,
    description: `Deleted authorization ID: ${authorization._id}`,
    req
  });

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc      Verify authorization
// @route     PUT /api/v1/authorizations/:id/verify
// @access    Private
exports.verifyAuthorization = asyncHandler(async (req, res, next) => {
  let authorization = await Authorization.findById(req.params.id);

  if (!authorization) {
    return next(
      new ErrorResponse(`Authorization not found with id of ${req.params.id}`, 404)
    );
  }

  // Update authorization
  authorization = await Authorization.findByIdAndUpdate(
    req.params.id,
    {
      verificationDate: Date.now(),
      verifiedBy: req.user.id,
      verificationMethod: req.body.verificationMethod,
      verificationReference: req.body.verificationReference,
      verificationNotes: req.body.verificationNotes,
      status: 'Active',
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
    resourceId: authorization._id,
    description: `Verified authorization ID: ${authorization._id}`,
    req
  });

  res.status(200).json({
    success: true,
    data: authorization
  });
});

// @desc      Update sessions used
// @route     PUT /api/v1/authorizations/:id/use-session
// @access    Private
exports.useAuthorizationSession = asyncHandler(async (req, res, next) => {
  let authorization = await Authorization.findById(req.params.id);

  if (!authorization) {
    return next(
      new ErrorResponse(`Authorization not found with id of ${req.params.id}`, 404)
    );
  }

  // Check if authorization is active
  if (authorization.status !== 'Active') {
    return next(
      new ErrorResponse(`Cannot use sessions for an authorization with status: ${authorization.status}`, 403)
    );
  }

  // Check if there are sessions remaining
  if (authorization.sessionsRemaining <= 0) {
    return next(
      new ErrorResponse('No sessions remaining in this authorization', 400)
    );
  }

  // Update sessions used
  const sessionsToUse = req.body.sessions || 1;
  
  authorization = await Authorization.findByIdAndUpdate(
    req.params.id,
    {
      sessionsUsed: authorization.sessionsUsed + sessionsToUse,
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
    resourceId: authorization._id,
    description: `Used ${sessionsToUse} session(s) from authorization ID: ${authorization._id}`,
    req
  });

  res.status(200).json({
    success: true,
    data: authorization
  });
});
