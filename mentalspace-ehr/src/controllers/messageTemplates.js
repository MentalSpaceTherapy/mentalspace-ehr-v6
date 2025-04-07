const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const MessageTemplate = require('../models/MessageTemplate');
const auditLogger = require('../utils/auditLogger');

// @desc      Get all message templates
// @route     GET /api/v1/message-templates
// @access    Private
exports.getMessageTemplates = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc      Get single message template
// @route     GET /api/v1/message-templates/:id
// @access    Private
exports.getMessageTemplate = asyncHandler(async (req, res, next) => {
  const template = await MessageTemplate.findById(req.params.id)
    .populate({
      path: 'createdBy',
      select: 'firstName lastName'
    })
    .populate({
      path: 'updatedBy',
      select: 'firstName lastName'
    });

  if (!template) {
    return next(
      new ErrorResponse(`Message template not found with id of ${req.params.id}`, 404)
    );
  }

  // Check if user has access to this template
  if (template.accessRoles && template.accessRoles.length > 0) {
    if (!template.accessRoles.includes(req.user.role)) {
      return next(
        new ErrorResponse(`Not authorized to access this template`, 403)
      );
    }
  }

  // Log the access
  await auditLogger.log({
    user: req.user.id,
    action: 'READ',
    resourceType: 'MESSAGING',
    resourceId: template._id,
    description: `Accessed message template: ${template.name}`,
    req
  });

  res.status(200).json({
    success: true,
    data: template
  });
});

// @desc      Create message template
// @route     POST /api/v1/message-templates
// @access    Private
exports.createMessageTemplate = asyncHandler(async (req, res, next) => {
  // Add creator to request body
  req.body.createdBy = req.user.id;

  // Check if user has permission to create templates
  if (req.user.role !== 'PRACTICE_ADMIN' && req.user.role !== 'SYSTEM_ADMIN') {
    return next(
      new ErrorResponse(`User role ${req.user.role} is not authorized to create message templates`, 403)
    );
  }

  const template = await MessageTemplate.create(req.body);

  // Log the action
  await auditLogger.log({
    user: req.user.id,
    action: 'CREATE',
    resourceType: 'MESSAGING',
    resourceId: template._id,
    description: `Created message template: ${template.name}`,
    req
  });

  res.status(201).json({
    success: true,
    data: template
  });
});

// @desc      Update message template
// @route     PUT /api/v1/message-templates/:id
// @access    Private
exports.updateMessageTemplate = asyncHandler(async (req, res, next) => {
  let template = await MessageTemplate.findById(req.params.id);

  if (!template) {
    return next(
      new ErrorResponse(`Message template not found with id of ${req.params.id}`, 404)
    );
  }

  // Check if user has permission to update templates
  if (req.user.role !== 'PRACTICE_ADMIN' && req.user.role !== 'SYSTEM_ADMIN') {
    return next(
      new ErrorResponse(`User role ${req.user.role} is not authorized to update message templates`, 403)
    );
  }

  // Add updater to request body
  req.body.updatedBy = req.user.id;

  template = await MessageTemplate.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  // Log the action
  await auditLogger.log({
    user: req.user.id,
    action: 'UPDATE',
    resourceType: 'MESSAGING',
    resourceId: template._id,
    description: `Updated message template: ${template.name}`,
    req
  });

  res.status(200).json({
    success: true,
    data: template
  });
});

// @desc      Delete message template
// @route     DELETE /api/v1/message-templates/:id
// @access    Private
exports.deleteMessageTemplate = asyncHandler(async (req, res, next) => {
  const template = await MessageTemplate.findById(req.params.id);

  if (!template) {
    return next(
      new ErrorResponse(`Message template not found with id of ${req.params.id}`, 404)
    );
  }

  // Check if user has permission to delete templates
  if (req.user.role !== 'PRACTICE_ADMIN' && req.user.role !== 'SYSTEM_ADMIN') {
    return next(
      new ErrorResponse(`User role ${req.user.role} is not authorized to delete message templates`, 403)
    );
  }

  await template.remove();

  // Log the action
  await auditLogger.log({
    user: req.user.id,
    action: 'DELETE',
    resourceType: 'MESSAGING',
    resourceId: template._id,
    description: `Deleted message template: ${template.name}`,
    req
  });

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc      Apply template variables
// @route     POST /api/v1/message-templates/:id/apply
// @access    Private
exports.applyTemplate = asyncHandler(async (req, res, next) => {
  const template = await MessageTemplate.findById(req.params.id);

  if (!template) {
    return next(
      new ErrorResponse(`Message template not found with id of ${req.params.id}`, 404)
    );
  }

  // Check if user has access to this template
  if (template.accessRoles && template.accessRoles.length > 0) {
    if (!template.accessRoles.includes(req.user.role)) {
      return next(
        new ErrorResponse(`Not authorized to use this template`, 403)
      );
    }
  }

  // Get variables from request body
  const variables = req.body.variables || {};

  // Apply variables to template content
  let subject = template.subject;
  let content = template.content;

  // Replace variables in subject and content
  template.variables.forEach(variable => {
    const value = variables[variable.name] || variable.defaultValue || '';
    const placeholder = `{{${variable.name}}}`;
    
    subject = subject.replace(new RegExp(placeholder, 'g'), value);
    content = content.replace(new RegExp(placeholder, 'g'), value);
  });

  // Log the action
  await auditLogger.log({
    user: req.user.id,
    action: 'READ',
    resourceType: 'MESSAGING',
    resourceId: template._id,
    description: `Applied message template: ${template.name}`,
    req
  });

  res.status(200).json({
    success: true,
    data: {
      subject,
      content
    }
  });
});
