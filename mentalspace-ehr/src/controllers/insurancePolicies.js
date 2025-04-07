const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const InsurancePolicy = require('../models/InsurancePolicy');
const Client = require('../models/Client');
const auditLogger = require('../utils/auditLogger');

// @desc      Get all insurance policies
// @route     GET /api/v1/insurance-policies
// @access    Private
exports.getInsurancePolicies = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc      Get insurance policies for a specific client
// @route     GET /api/v1/clients/:clientId/insurance-policies
// @access    Private
exports.getClientInsurancePolicies = asyncHandler(async (req, res, next) => {
  const policies = await InsurancePolicy.find({ client: req.params.clientId })
    .sort({ coverageType: 1 });

  // Log the access
  await auditLogger.log({
    user: req.user.id,
    action: 'READ',
    resourceType: 'INSURANCE',
    description: `Accessed insurance policies for client ID: ${req.params.clientId}`,
    req
  });

  res.status(200).json({
    success: true,
    count: policies.length,
    data: policies
  });
});

// @desc      Get single insurance policy
// @route     GET /api/v1/insurance-policies/:id
// @access    Private
exports.getInsurancePolicy = asyncHandler(async (req, res, next) => {
  const policy = await InsurancePolicy.findById(req.params.id)
    .populate({
      path: 'client',
      select: 'firstName lastName dateOfBirth'
    });

  if (!policy) {
    return next(
      new ErrorResponse(`Insurance policy not found with id of ${req.params.id}`, 404)
    );
  }

  // Log the access
  await auditLogger.log({
    user: req.user.id,
    action: 'READ',
    resourceType: 'INSURANCE',
    resourceId: policy._id,
    description: `Accessed insurance policy for ${policy.client.firstName} ${policy.client.lastName}`,
    req
  });

  res.status(200).json({
    success: true,
    data: policy
  });
});

// @desc      Create insurance policy
// @route     POST /api/v1/clients/:clientId/insurance-policies
// @access    Private
exports.createInsurancePolicy = asyncHandler(async (req, res, next) => {
  // Check if client exists
  const client = await Client.findById(req.params.clientId);

  if (!client) {
    return next(
      new ErrorResponse(`Client not found with id of ${req.params.clientId}`, 404)
    );
  }

  // Add client to request body
  req.body.client = req.params.clientId;

  // Add verification info if provided
  if (req.body.verified) {
    req.body.verificationDate = Date.now();
    req.body.verifiedBy = req.user.id;
  }

  const policy = await InsurancePolicy.create(req.body);

  // Log the action
  await auditLogger.log({
    user: req.user.id,
    action: 'CREATE',
    resourceType: 'INSURANCE',
    resourceId: policy._id,
    description: `Created insurance policy for client: ${client.firstName} ${client.lastName}`,
    req
  });

  res.status(201).json({
    success: true,
    data: policy
  });
});

// @desc      Update insurance policy
// @route     PUT /api/v1/insurance-policies/:id
// @access    Private
exports.updateInsurancePolicy = asyncHandler(async (req, res, next) => {
  let policy = await InsurancePolicy.findById(req.params.id);

  if (!policy) {
    return next(
      new ErrorResponse(`Insurance policy not found with id of ${req.params.id}`, 404)
    );
  }

  // Add verification info if status changed to verified
  if (req.body.status === 'Active' && policy.status !== 'Active') {
    req.body.verificationDate = Date.now();
    req.body.verifiedBy = req.user.id;
  }

  policy = await InsurancePolicy.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  // Log the action
  await auditLogger.log({
    user: req.user.id,
    action: 'UPDATE',
    resourceType: 'INSURANCE',
    resourceId: policy._id,
    description: `Updated insurance policy ID: ${policy._id}`,
    req
  });

  res.status(200).json({
    success: true,
    data: policy
  });
});

// @desc      Delete insurance policy
// @route     DELETE /api/v1/insurance-policies/:id
// @access    Private
exports.deleteInsurancePolicy = asyncHandler(async (req, res, next) => {
  const policy = await InsurancePolicy.findById(req.params.id);

  if (!policy) {
    return next(
      new ErrorResponse(`Insurance policy not found with id of ${req.params.id}`, 404)
    );
  }

  await policy.remove();

  // Log the action
  await auditLogger.log({
    user: req.user.id,
    action: 'DELETE',
    resourceType: 'INSURANCE',
    resourceId: policy._id,
    description: `Deleted insurance policy ID: ${policy._id}`,
    req
  });

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc      Add document to insurance policy
// @route     POST /api/v1/insurance-policies/:id/documents
// @access    Private
exports.addPolicyDocument = asyncHandler(async (req, res, next) => {
  let policy = await InsurancePolicy.findById(req.params.id);

  if (!policy) {
    return next(
      new ErrorResponse(`Insurance policy not found with id of ${req.params.id}`, 404)
    );
  }

  // Validate request
  if (!req.body.name || !req.body.fileUrl) {
    return next(
      new ErrorResponse('Please provide document name and file URL', 400)
    );
  }

  // Add document to policy
  const document = {
    name: req.body.name,
    fileUrl: req.body.fileUrl,
    uploadDate: Date.now(),
    uploadedBy: req.user.id
  };

  policy = await InsurancePolicy.findByIdAndUpdate(
    req.params.id,
    { $push: { documents: document } },
    { new: true, runValidators: true }
  );

  // Log the action
  await auditLogger.log({
    user: req.user.id,
    action: 'UPDATE',
    resourceType: 'INSURANCE',
    resourceId: policy._id,
    description: `Added document to insurance policy ID: ${policy._id}`,
    req
  });

  res.status(200).json({
    success: true,
    data: policy
  });
});
