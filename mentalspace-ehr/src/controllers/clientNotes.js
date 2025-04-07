const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const ClientNote = require('../models/ClientNote');
const Client = require('../models/Client');
const auditLogger = require('../utils/auditLogger');

// @desc      Get all client notes
// @route     GET /api/v1/client-notes
// @access    Private
exports.getClientNotes = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc      Get notes for a specific client
// @route     GET /api/v1/clients/:clientId/notes
// @access    Private
exports.getClientNotesForClient = asyncHandler(async (req, res, next) => {
  // Build query to handle private notes
  const query = { client: req.params.clientId };
  
  // If user is not admin or supervisor, filter out private notes they don't have access to
  if (req.user.role !== 'PRACTICE_ADMIN' && req.user.role !== 'SUPERVISOR') {
    query.$or = [
      { isPrivate: false },
      { isPrivate: true, createdBy: req.user.id },
      { isPrivate: true, privateAccessRoles: req.user.role }
    ];
  }
  
  const notes = await ClientNote.find(query)
    .populate({
      path: 'createdBy',
      select: 'firstName lastName'
    })
    .populate({
      path: 'updatedBy',
      select: 'firstName lastName'
    })
    .sort({ createdAt: -1 });

  // Log the access
  await auditLogger.log({
    user: req.user.id,
    action: 'READ',
    resourceType: 'CLIENT',
    description: `Accessed notes for client ID: ${req.params.clientId}`,
    req
  });

  res.status(200).json({
    success: true,
    count: notes.length,
    data: notes
  });
});

// @desc      Get single client note
// @route     GET /api/v1/client-notes/:id
// @access    Private
exports.getClientNote = asyncHandler(async (req, res, next) => {
  const note = await ClientNote.findById(req.params.id)
    .populate({
      path: 'client',
      select: 'firstName lastName'
    })
    .populate({
      path: 'createdBy',
      select: 'firstName lastName'
    })
    .populate({
      path: 'updatedBy',
      select: 'firstName lastName'
    });

  if (!note) {
    return next(
      new ErrorResponse(`Client note not found with id of ${req.params.id}`, 404)
    );
  }

  // Check if user has access to private note
  if (
    note.isPrivate &&
    note.createdBy._id.toString() !== req.user.id &&
    !note.privateAccessRoles.includes(req.user.role) &&
    req.user.role !== 'PRACTICE_ADMIN' &&
    req.user.role !== 'SUPERVISOR'
  ) {
    return next(
      new ErrorResponse(`Not authorized to access this note`, 403)
    );
  }

  // Log the access
  await auditLogger.log({
    user: req.user.id,
    action: 'READ',
    resourceType: 'CLIENT',
    resourceId: note.client._id,
    description: `Accessed note for client: ${note.client.firstName} ${note.client.lastName}`,
    req
  });

  res.status(200).json({
    success: true,
    data: note
  });
});

// @desc      Create client note
// @route     POST /api/v1/clients/:clientId/notes
// @access    Private
exports.createClientNote = asyncHandler(async (req, res, next) => {
  // Check if client exists
  const client = await Client.findById(req.params.clientId);

  if (!client) {
    return next(
      new ErrorResponse(`Client not found with id of ${req.params.clientId}`, 404)
    );
  }

  // Add client to request body
  req.body.client = req.params.clientId;
  
  // Add creator to request body
  req.body.createdBy = req.user.id;
  req.body.updatedBy = req.user.id;

  const note = await ClientNote.create(req.body);

  // Log the action
  await auditLogger.log({
    user: req.user.id,
    action: 'CREATE',
    resourceType: 'CLIENT',
    resourceId: client._id,
    description: `Created note for client: ${client.firstName} ${client.lastName}`,
    req
  });

  res.status(201).json({
    success: true,
    data: note
  });
});

// @desc      Update client note
// @route     PUT /api/v1/client-notes/:id
// @access    Private
exports.updateClientNote = asyncHandler(async (req, res, next) => {
  let note = await ClientNote.findById(req.params.id);

  if (!note) {
    return next(
      new ErrorResponse(`Client note not found with id of ${req.params.id}`, 404)
    );
  }

  // Check if user is authorized to update this note
  if (
    note.createdBy.toString() !== req.user.id &&
    req.user.role !== 'PRACTICE_ADMIN' &&
    req.user.role !== 'SUPERVISOR'
  ) {
    return next(
      new ErrorResponse(`Not authorized to update this note`, 403)
    );
  }

  // Add updater to request body
  req.body.updatedBy = req.user.id;

  // If follow-up is being marked as completed, add completion info
  if (req.body.followUpCompleted && !note.followUpCompleted) {
    req.body.followUpCompletedDate = Date.now();
    req.body.followUpCompletedBy = req.user.id;
  }

  note = await ClientNote.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  // Log the action
  await auditLogger.log({
    user: req.user.id,
    action: 'UPDATE',
    resourceType: 'CLIENT',
    resourceId: note.client,
    description: `Updated note ID: ${note._id}`,
    req
  });

  res.status(200).json({
    success: true,
    data: note
  });
});

// @desc      Delete client note
// @route     DELETE /api/v1/client-notes/:id
// @access    Private
exports.deleteClientNote = asyncHandler(async (req, res, next) => {
  const note = await ClientNote.findById(req.params.id);

  if (!note) {
    return next(
      new ErrorResponse(`Client note not found with id of ${req.params.id}`, 404)
    );
  }

  // Check if user is authorized to delete this note
  if (
    note.createdBy.toString() !== req.user.id &&
    req.user.role !== 'PRACTICE_ADMIN' &&
    req.user.role !== 'SUPERVISOR'
  ) {
    return next(
      new ErrorResponse(`Not authorized to delete this note`, 403)
    );
  }

  await note.remove();

  // Log the action
  await auditLogger.log({
    user: req.user.id,
    action: 'DELETE',
    resourceType: 'CLIENT',
    resourceId: note.client,
    description: `Deleted note ID: ${note._id}`,
    req
  });

  res.status(200).json({
    success: true,
    data: {}
  });
});
