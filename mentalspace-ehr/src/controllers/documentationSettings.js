const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const DocumentationSettings = require('../models/DocumentationSettings');
const auditLogger = require('../utils/auditLogger');

// @desc      Get documentation settings
// @route     GET /api/v1/documentation-settings
// @access    Private
exports.getDocumentationSettings = asyncHandler(async (req, res, next) => {
  // Get the most recent settings
  const settings = await DocumentationSettings.findOne()
    .sort({ createdAt: -1 })
    .populate({
      path: 'noteTypes.defaultTemplate',
      select: 'name structure'
    });

  if (!settings) {
    return next(
      new ErrorResponse('Documentation settings not found', 404)
    );
  }

  // Log the access
  await auditLogger.log({
    user: req.user.id,
    action: 'READ',
    resourceType: 'DOCUMENTATION',
    description: 'Accessed documentation settings',
    req
  });

  res.status(200).json({
    success: true,
    data: settings
  });
});

// @desc      Create documentation settings
// @route     POST /api/v1/documentation-settings
// @access    Private
exports.createDocumentationSettings = asyncHandler(async (req, res, next) => {
  // Add creator to request body
  req.body.createdBy = req.user.id;
  req.body.updatedBy = req.user.id;

  const settings = await DocumentationSettings.create(req.body);

  // Log the action
  await auditLogger.log({
    user: req.user.id,
    action: 'CREATE',
    resourceType: 'DOCUMENTATION',
    resourceId: settings._id,
    description: 'Created documentation settings',
    req
  });

  res.status(201).json({
    success: true,
    data: settings
  });
});

// @desc      Update documentation settings
// @route     PUT /api/v1/documentation-settings/:id
// @access    Private
exports.updateDocumentationSettings = asyncHandler(async (req, res, next) => {
  let settings = await DocumentationSettings.findById(req.params.id);

  if (!settings) {
    return next(
      new ErrorResponse(`Documentation settings not found with id of ${req.params.id}`, 404)
    );
  }

  // Add updater to request body
  req.body.updatedBy = req.user.id;

  settings = await DocumentationSettings.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  // Log the action
  await auditLogger.log({
    user: req.user.id,
    action: 'UPDATE',
    resourceType: 'DOCUMENTATION',
    resourceId: settings._id,
    description: 'Updated documentation settings',
    req
  });

  res.status(200).json({
    success: true,
    data: settings
  });
});

// @desc      Get note type settings
// @route     GET /api/v1/documentation-settings/note-types/:type
// @access    Private
exports.getNoteTypeSettings = asyncHandler(async (req, res, next) => {
  // Get the most recent settings
  const settings = await DocumentationSettings.findOne()
    .sort({ createdAt: -1 });

  if (!settings) {
    return next(
      new ErrorResponse('Documentation settings not found', 404)
    );
  }

  // Find the specific note type settings
  const noteTypeSettings = settings.noteTypes.find(
    type => type.type === req.params.type
  );

  if (!noteTypeSettings) {
    return next(
      new ErrorResponse(`Settings for note type ${req.params.type} not found`, 404)
    );
  }

  // Log the access
  await auditLogger.log({
    user: req.user.id,
    action: 'READ',
    resourceType: 'DOCUMENTATION',
    description: `Accessed settings for note type: ${req.params.type}`,
    req
  });

  res.status(200).json({
    success: true,
    data: noteTypeSettings
  });
});

// @desc      Add custom field
// @route     POST /api/v1/documentation-settings/:id/custom-fields
// @access    Private
exports.addCustomField = asyncHandler(async (req, res, next) => {
  let settings = await DocumentationSettings.findById(req.params.id);

  if (!settings) {
    return next(
      new ErrorResponse(`Documentation settings not found with id of ${req.params.id}`, 404)
    );
  }

  // Validate request
  if (!req.body.name || !req.body.type) {
    return next(
      new ErrorResponse('Please provide field name and type', 400)
    );
  }

  // Add custom field
  settings = await DocumentationSettings.findByIdAndUpdate(
    req.params.id,
    { 
      $push: { customFields: req.body },
      updatedBy: req.user.id,
      updatedAt: Date.now()
    },
    { new: true, runValidators: true }
  );

  // Log the action
  await auditLogger.log({
    user: req.user.id,
    action: 'UPDATE',
    resourceType: 'DOCUMENTATION',
    resourceId: settings._id,
    description: `Added custom field: ${req.body.name}`,
    req
  });

  res.status(200).json({
    success: true,
    data: settings
  });
});

// @desc      Remove custom field
// @route     DELETE /api/v1/documentation-settings/:id/custom-fields/:fieldId
// @access    Private
exports.removeCustomField = asyncHandler(async (req, res, next) => {
  let settings = await DocumentationSettings.findById(req.params.id);

  if (!settings) {
    return next(
      new ErrorResponse(`Documentation settings not found with id of ${req.params.id}`, 404)
    );
  }

  // Find the field
  const fieldIndex = settings.customFields.findIndex(
    field => field._id.toString() === req.params.fieldId
  );

  if (fieldIndex === -1) {
    return next(
      new ErrorResponse(`Custom field not found with id of ${req.params.fieldId}`, 404)
    );
  }

  // Remove the field
  settings.customFields.splice(fieldIndex, 1);
  settings.updatedBy = req.user.id;
  settings.updatedAt = Date.now();

  await settings.save();

  // Log the action
  await auditLogger.log({
    user: req.user.id,
    action: 'UPDATE',
    resourceType: 'DOCUMENTATION',
    resourceId: settings._id,
    description: `Removed custom field ID: ${req.params.fieldId}`,
    req
  });

  res.status(200).json({
    success: true,
    data: settings
  });
});
