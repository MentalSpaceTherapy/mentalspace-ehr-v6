const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const RiskAssessment = require('../models/RiskAssessment');
const Client = require('../models/Client');
const Staff = require('../models/Staff');
const auditLogger = require('../utils/auditLogger');

// @desc      Get all risk assessments
// @route     GET /api/v1/risk-assessments
// @access    Private
exports.getRiskAssessments = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc      Get risk assessments for a specific client
// @route     GET /api/v1/clients/:clientId/risk-assessments
// @access    Private
exports.getClientRiskAssessments = asyncHandler(async (req, res, next) => {
  const riskAssessments = await RiskAssessment.find({ client: req.params.clientId })
    .populate({
      path: 'provider',
      select: 'firstName lastName'
    })
    .populate({
      path: 'note',
      select: 'noteType title sessionDate'
    })
    .sort({ assessmentDate: -1 });

  // Log the access
  await auditLogger.log({
    user: req.user.id,
    action: 'READ',
    resourceType: 'DOCUMENTATION',
    description: `Accessed risk assessments for client ID: ${req.params.clientId}`,
    req
  });

  res.status(200).json({
    success: true,
    count: riskAssessments.length,
    data: riskAssessments
  });
});

// @desc      Get single risk assessment
// @route     GET /api/v1/risk-assessments/:id
// @access    Private
exports.getRiskAssessment = asyncHandler(async (req, res, next) => {
  const riskAssessment = await RiskAssessment.findById(req.params.id)
    .populate({
      path: 'client',
      select: 'firstName lastName dateOfBirth'
    })
    .populate({
      path: 'provider',
      select: 'firstName lastName'
    })
    .populate({
      path: 'note',
      select: 'noteType title sessionDate'
    });

  if (!riskAssessment) {
    return next(
      new ErrorResponse(`Risk assessment not found with id of ${req.params.id}`, 404)
    );
  }

  // Log the access
  await auditLogger.log({
    user: req.user.id,
    action: 'READ',
    resourceType: 'DOCUMENTATION',
    resourceId: riskAssessment._id,
    description: `Accessed risk assessment for ${riskAssessment.client.firstName} ${riskAssessment.client.lastName}`,
    req
  });

  res.status(200).json({
    success: true,
    data: riskAssessment
  });
});

// @desc      Create risk assessment
// @route     POST /api/v1/risk-assessments
// @access    Private
exports.createRiskAssessment = asyncHandler(async (req, res, next) => {
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

  // Add creator to request body
  req.body.createdBy = req.user.id;
  req.body.updatedBy = req.user.id;

  const riskAssessment = await RiskAssessment.create(req.body);

  // If risk level is high or extreme, create a client flag
  if (riskAssessment.overallRiskLevel === 'High' || riskAssessment.overallRiskLevel === 'Extreme') {
    const ClientFlag = require('../models/ClientFlag');
    await ClientFlag.create({
      client: riskAssessment.client,
      flagType: 'High Risk',
      severity: riskAssessment.overallRiskLevel === 'Extreme' ? 'Critical' : 'High',
      description: `Risk assessment on ${new Date(riskAssessment.assessmentDate).toLocaleDateString()} identified ${riskAssessment.overallRiskLevel} risk level.`,
      actionRequired: true,
      actionDescription: riskAssessment.followUpPlan || 'Follow up required based on risk assessment',
      displayInChart: true,
      displayColor: riskAssessment.overallRiskLevel === 'Extreme' ? '#FF0000' : '#FF6600',
      createdBy: req.user.id,
      updatedBy: req.user.id
    });
  }

  // Log the action
  await auditLogger.log({
    user: req.user.id,
    action: 'CREATE',
    resourceType: 'DOCUMENTATION',
    resourceId: riskAssessment._id,
    description: `Created risk assessment for client: ${client.firstName} ${client.lastName}`,
    req
  });

  res.status(201).json({
    success: true,
    data: riskAssessment
  });
});

// @desc      Update risk assessment
// @route     PUT /api/v1/risk-assessments/:id
// @access    Private
exports.updateRiskAssessment = asyncHandler(async (req, res, next) => {
  let riskAssessment = await RiskAssessment.findById(req.params.id);

  if (!riskAssessment) {
    return next(
      new ErrorResponse(`Risk assessment not found with id of ${req.params.id}`, 404)
    );
  }

  // Add updater to request body
  req.body.updatedBy = req.user.id;

  riskAssessment = await RiskAssessment.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  // Log the action
  await auditLogger.log({
    user: req.user.id,
    action: 'UPDATE',
    resourceType: 'DOCUMENTATION',
    resourceId: riskAssessment._id,
    description: `Updated risk assessment ID: ${riskAssessment._id}`,
    req
  });

  res.status(200).json({
    success: true,
    data: riskAssessment
  });
});

// @desc      Delete risk assessment
// @route     DELETE /api/v1/risk-assessments/:id
// @access    Private
exports.deleteRiskAssessment = asyncHandler(async (req, res, next) => {
  const riskAssessment = await RiskAssessment.findById(req.params.id);

  if (!riskAssessment) {
    return next(
      new ErrorResponse(`Risk assessment not found with id of ${req.params.id}`, 404)
    );
  }

  await riskAssessment.remove();

  // Log the action
  await auditLogger.log({
    user: req.user.id,
    action: 'DELETE',
    resourceType: 'DOCUMENTATION',
    resourceId: riskAssessment._id,
    description: `Deleted risk assessment ID: ${riskAssessment._id}`,
    req
  });

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc      Get latest risk assessment for a client
// @route     GET /api/v1/clients/:clientId/risk-assessments/latest
// @access    Private
exports.getLatestRiskAssessment = asyncHandler(async (req, res, next) => {
  const riskAssessment = await RiskAssessment.findOne({ client: req.params.clientId })
    .sort({ assessmentDate: -1 })
    .populate({
      path: 'provider',
      select: 'firstName lastName'
    });

  if (!riskAssessment) {
    return res.status(200).json({
      success: true,
      data: null
    });
  }

  // Log the access
  await auditLogger.log({
    user: req.user.id,
    action: 'READ',
    resourceType: 'DOCUMENTATION',
    resourceId: riskAssessment._id,
    description: `Accessed latest risk assessment for client ID: ${req.params.clientId}`,
    req
  });

  res.status(200).json({
    success: true,
    data: riskAssessment
  });
});
