const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const NoteTemplate = require('../models/NoteTemplate');
const auditLogger = require('../utils/auditLogger');

// @desc      Get all note templates
// @route     GET /api/v1/note-templates
// @access    Private
exports.getNoteTemplates = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc      Get note templates by type
// @route     GET /api/v1/note-templates/type/:noteType
// @access    Private
exports.getNoteTemplatesByType = asyncHandler(async (req, res, next) => {
  const templates = await NoteTemplate.find({ 
    noteType: req.params.noteType,
    isActive: true,
    $or: [
      { accessRoles: { $in: [req.user.role] } },
      { accessRoles: { $size: 0 } }
    ]
  }).sort({ name: 1 });

  // Log the access
  await auditLogger.log({
    user: req.user.id,
    action: 'READ',
    resourceType: 'DOCUMENTATION',
    description: `Accessed templates for note type: ${req.params.noteType}`,
    req
  });

  res.status(200).json({
    success: true,
    count: templates.length,
    data: templates
  });
});

// @desc      Get single note template
// @route     GET /api/v1/note-templates/:id
// @access    Private
exports.getNoteTemplate = asyncHandler(async (req, res, next) => {
  const template = await NoteTemplate.findById(req.params.id);

  if (!template) {
    return next(
      new ErrorResponse(`Note template not found with id of ${req.params.id}`, 404)
    );
  }

  // Log the access
  await auditLogger.log({
    user: req.user.id,
    action: 'READ',
    resourceType: 'DOCUMENTATION',
    resourceId: template._id,
    description: `Accessed template: ${template.name}`,
    req
  });

  res.status(200).json({
    success: true,
    data: template
  });
});

// @desc      Create note template
// @route     POST /api/v1/note-templates
// @access    Private
exports.createNoteTemplate = asyncHandler(async (req, res, next) => {
  // Add creator to request body
  req.body.createdBy = req.user.id;
  req.body.updatedBy = req.user.id;

  const template = await NoteTemplate.create(req.body);

  // Log the action
  await auditLogger.log({
    user: req.user.id,
    action: 'CREATE',
    resourceType: 'DOCUMENTATION',
    resourceId: template._id,
    description: `Created template: ${template.name}`,
    req
  });

  res.status(201).json({
    success: true,
    data: template
  });
});

// @desc      Update note template
// @route     PUT /api/v1/note-templates/:id
// @access    Private
exports.updateNoteTemplate = asyncHandler(async (req, res, next) => {
  let template = await NoteTemplate.findById(req.params.id);

  if (!template) {
    return next(
      new ErrorResponse(`Note template not found with id of ${req.params.id}`, 404)
    );
  }

  // Add updater to request body
  req.body.updatedBy = req.user.id;

  template = await NoteTemplate.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  // Log the action
  await auditLogger.log({
    user: req.user.id,
    action: 'UPDATE',
    resourceType: 'DOCUMENTATION',
    resourceId: template._id,
    description: `Updated template: ${template.name}`,
    req
  });

  res.status(200).json({
    success: true,
    data: template
  });
});

// @desc      Delete note template
// @route     DELETE /api/v1/note-templates/:id
// @access    Private
exports.deleteNoteTemplate = asyncHandler(async (req, res, next) => {
  const template = await NoteTemplate.findById(req.params.id);

  if (!template) {
    return next(
      new ErrorResponse(`Note template not found with id of ${req.params.id}`, 404)
    );
  }

  await template.remove();

  // Log the action
  await auditLogger.log({
    user: req.user.id,
    action: 'DELETE',
    resourceType: 'DOCUMENTATION',
    resourceId: template._id,
    description: `Deleted template: ${template.name}`,
    req
  });

  res.status(200).json({
    success: true,
    data: {}
  });
});
