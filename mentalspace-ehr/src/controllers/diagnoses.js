const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Diagnosis = require('../models/Diagnosis');
const auditLogger = require('../utils/auditLogger');

// @desc      Get all diagnoses
// @route     GET /api/v1/diagnoses
// @access    Private
exports.getDiagnoses = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc      Get diagnoses by code type
// @route     GET /api/v1/diagnoses/type/:codeType
// @access    Private
exports.getDiagnosesByType = asyncHandler(async (req, res, next) => {
  const diagnoses = await Diagnosis.find({ 
    codeType: req.params.codeType,
    isActive: true
  }).sort({ code: 1 });

  // Log the access
  await auditLogger.log({
    user: req.user.id,
    action: 'READ',
    resourceType: 'DOCUMENTATION',
    description: `Accessed diagnoses for code type: ${req.params.codeType}`,
    req
  });

  res.status(200).json({
    success: true,
    count: diagnoses.length,
    data: diagnoses
  });
});

// @desc      Get commonly used diagnoses
// @route     GET /api/v1/diagnoses/common
// @access    Private
exports.getCommonDiagnoses = asyncHandler(async (req, res, next) => {
  const diagnoses = await Diagnosis.find({ 
    commonlyUsed: true,
    isActive: true
  }).sort({ code: 1 });

  // Log the access
  await auditLogger.log({
    user: req.user.id,
    action: 'READ',
    resourceType: 'DOCUMENTATION',
    description: 'Accessed commonly used diagnoses',
    req
  });

  res.status(200).json({
    success: true,
    count: diagnoses.length,
    data: diagnoses
  });
});

// @desc      Get single diagnosis
// @route     GET /api/v1/diagnoses/:id
// @access    Private
exports.getDiagnosis = asyncHandler(async (req, res, next) => {
  const diagnosis = await Diagnosis.findById(req.params.id);

  if (!diagnosis) {
    return next(
      new ErrorResponse(`Diagnosis not found with id of ${req.params.id}`, 404)
    );
  }

  // Log the access
  await auditLogger.log({
    user: req.user.id,
    action: 'READ',
    resourceType: 'DOCUMENTATION',
    resourceId: diagnosis._id,
    description: `Accessed diagnosis: ${diagnosis.code}`,
    req
  });

  res.status(200).json({
    success: true,
    data: diagnosis
  });
});

// @desc      Create diagnosis
// @route     POST /api/v1/diagnoses
// @access    Private
exports.createDiagnosis = asyncHandler(async (req, res, next) => {
  const diagnosis = await Diagnosis.create(req.body);

  // Log the action
  await auditLogger.log({
    user: req.user.id,
    action: 'CREATE',
    resourceType: 'DOCUMENTATION',
    resourceId: diagnosis._id,
    description: `Created diagnosis: ${diagnosis.code}`,
    req
  });

  res.status(201).json({
    success: true,
    data: diagnosis
  });
});

// @desc      Update diagnosis
// @route     PUT /api/v1/diagnoses/:id
// @access    Private
exports.updateDiagnosis = asyncHandler(async (req, res, next) => {
  let diagnosis = await Diagnosis.findById(req.params.id);

  if (!diagnosis) {
    return next(
      new ErrorResponse(`Diagnosis not found with id of ${req.params.id}`, 404)
    );
  }

  diagnosis = await Diagnosis.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  // Log the action
  await auditLogger.log({
    user: req.user.id,
    action: 'UPDATE',
    resourceType: 'DOCUMENTATION',
    resourceId: diagnosis._id,
    description: `Updated diagnosis: ${diagnosis.code}`,
    req
  });

  res.status(200).json({
    success: true,
    data: diagnosis
  });
});

// @desc      Delete diagnosis
// @route     DELETE /api/v1/diagnoses/:id
// @access    Private
exports.deleteDiagnosis = asyncHandler(async (req, res, next) => {
  const diagnosis = await Diagnosis.findById(req.params.id);

  if (!diagnosis) {
    return next(
      new ErrorResponse(`Diagnosis not found with id of ${req.params.id}`, 404)
    );
  }

  await diagnosis.remove();

  // Log the action
  await auditLogger.log({
    user: req.user.id,
    action: 'DELETE',
    resourceType: 'DOCUMENTATION',
    resourceId: diagnosis._id,
    description: `Deleted diagnosis: ${diagnosis.code}`,
    req
  });

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc      Search diagnoses
// @route     GET /api/v1/diagnoses/search/:term
// @access    Private
exports.searchDiagnoses = asyncHandler(async (req, res, next) => {
  const searchTerm = req.params.term;
  
  const diagnoses = await Diagnosis.find({
    isActive: true,
    $or: [
      { code: { $regex: searchTerm, $options: 'i' } },
      { description: { $regex: searchTerm, $options: 'i' } }
    ]
  }).limit(20).sort({ code: 1 });

  // Log the access
  await auditLogger.log({
    user: req.user.id,
    action: 'READ',
    resourceType: 'DOCUMENTATION',
    description: `Searched diagnoses with term: ${searchTerm}`,
    req
  });

  res.status(200).json({
    success: true,
    count: diagnoses.length,
    data: diagnoses
  });
});
