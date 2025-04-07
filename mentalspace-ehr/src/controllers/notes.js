const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Note = require('../models/Note');
const NoteVersion = require('../models/NoteVersion');
const Client = require('../models/Client');
const Staff = require('../models/Staff');
const Appointment = require('../models/Appointment');
const auditLogger = require('../utils/auditLogger');

// @desc      Get all notes
// @route     GET /api/v1/notes
// @access    Private
exports.getNotes = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc      Get notes for a specific client
// @route     GET /api/v1/clients/:clientId/notes
// @access    Private
exports.getClientNotes = asyncHandler(async (req, res, next) => {
  const notes = await Note.find({ client: req.params.clientId })
    .populate({
      path: 'provider',
      select: 'firstName lastName'
    })
    .populate({
      path: 'appointment',
      select: 'startTime appointmentType'
    })
    .sort({ sessionDate: -1 });

  // Log the access
  await auditLogger.log({
    user: req.user.id,
    action: 'READ',
    resourceType: 'DOCUMENTATION',
    description: `Accessed notes for client ID: ${req.params.clientId}`,
    req
  });

  res.status(200).json({
    success: true,
    count: notes.length,
    data: notes
  });
});

// @desc      Get notes created by a specific provider
// @route     GET /api/v1/staff/:providerId/notes
// @access    Private
exports.getProviderNotes = asyncHandler(async (req, res, next) => {
  const notes = await Note.find({ provider: req.params.providerId })
    .populate({
      path: 'client',
      select: 'firstName lastName'
    })
    .populate({
      path: 'appointment',
      select: 'startTime appointmentType'
    })
    .sort({ sessionDate: -1 });

  // Log the access
  await auditLogger.log({
    user: req.user.id,
    action: 'READ',
    resourceType: 'DOCUMENTATION',
    description: `Accessed notes for provider ID: ${req.params.providerId}`,
    req
  });

  res.status(200).json({
    success: true,
    count: notes.length,
    data: notes
  });
});

// @desc      Get single note
// @route     GET /api/v1/notes/:id
// @access    Private
exports.getNote = asyncHandler(async (req, res, next) => {
  const note = await Note.findById(req.params.id)
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
      select: 'startTime endTime appointmentType location'
    })
    .populate({
      path: 'diagnosisCodes',
      select: 'code description codeType'
    })
    .populate({
      path: 'versions',
      select: 'createdAt createdBy',
      populate: {
        path: 'createdBy',
        select: 'firstName lastName'
      }
    });

  if (!note) {
    return next(
      new ErrorResponse(`Note not found with id of ${req.params.id}`, 404)
    );
  }

  // Log the access
  await auditLogger.log({
    user: req.user.id,
    action: 'READ',
    resourceType: 'DOCUMENTATION',
    resourceId: note._id,
    description: `Accessed note for ${note.client.firstName} ${note.client.lastName}`,
    req
  });

  res.status(200).json({
    success: true,
    data: note
  });
});

// @desc      Create note
// @route     POST /api/v1/notes
// @access    Private
exports.createNote = asyncHandler(async (req, res, next) => {
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

  // Check if appointment exists if provided
  if (req.body.appointment) {
    const appointment = await Appointment.findById(req.body.appointment);
    if (!appointment) {
      return next(
        new ErrorResponse(`Appointment not found with id of ${req.body.appointment}`, 404)
      );
    }
  }

  // Add creator to request body
  req.body.createdBy = req.user.id;
  req.body.updatedBy = req.user.id;

  const note = await Note.create(req.body);

  // Log the action
  await auditLogger.log({
    user: req.user.id,
    action: 'CREATE',
    resourceType: 'DOCUMENTATION',
    resourceId: note._id,
    description: `Created ${note.noteType} for client: ${client.firstName} ${client.lastName}`,
    req
  });

  res.status(201).json({
    success: true,
    data: note
  });
});

// @desc      Update note
// @route     PUT /api/v1/notes/:id
// @access    Private
exports.updateNote = asyncHandler(async (req, res, next) => {
  let note = await Note.findById(req.params.id);

  if (!note) {
    return next(
      new ErrorResponse(`Note not found with id of ${req.params.id}`, 404)
    );
  }

  // Check if note is locked
  if (note.status === 'Locked') {
    return next(
      new ErrorResponse('Cannot update a locked note', 403)
    );
  }

  // Add updater to request body
  req.body.updatedBy = req.user.id;

  note = await Note.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  // Log the action
  await auditLogger.log({
    user: req.user.id,
    action: 'UPDATE',
    resourceType: 'DOCUMENTATION',
    resourceId: note._id,
    description: `Updated note ID: ${note._id}`,
    req
  });

  res.status(200).json({
    success: true,
    data: note
  });
});

// @desc      Delete note
// @route     DELETE /api/v1/notes/:id
// @access    Private
exports.deleteNote = asyncHandler(async (req, res, next) => {
  const note = await Note.findById(req.params.id);

  if (!note) {
    return next(
      new ErrorResponse(`Note not found with id of ${req.params.id}`, 404)
    );
  }

  // Check if note is locked or signed
  if (note.status !== 'Draft') {
    return next(
      new ErrorResponse(`Cannot delete a note with status: ${note.status}`, 403)
    );
  }

  await note.remove();

  // Log the action
  await auditLogger.log({
    user: req.user.id,
    action: 'DELETE',
    resourceType: 'DOCUMENTATION',
    resourceId: note._id,
    description: `Deleted note ID: ${note._id}`,
    req
  });

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc      Sign note
// @route     PUT /api/v1/notes/:id/sign
// @access    Private
exports.signNote = asyncHandler(async (req, res, next) => {
  let note = await Note.findById(req.params.id);

  if (!note) {
    return next(
      new ErrorResponse(`Note not found with id of ${req.params.id}`, 404)
    );
  }

  // Check if note is already signed
  if (note.status !== 'Draft' && note.status !== 'Completed') {
    return next(
      new ErrorResponse(`Cannot sign a note with status: ${note.status}`, 403)
    );
  }

  // Update note
  note = await Note.findByIdAndUpdate(
    req.params.id,
    {
      status: note.coSignRequired ? 'Signed' : 'Locked',
      signedAt: Date.now(),
      signedBy: req.user.id,
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
    resourceId: note._id,
    description: `Signed note ID: ${note._id}`,
    req
  });

  res.status(200).json({
    success: true,
    data: note
  });
});

// @desc      Co-sign note
// @route     PUT /api/v1/notes/:id/cosign
// @access    Private
exports.coSignNote = asyncHandler(async (req, res, next) => {
  let note = await Note.findById(req.params.id);

  if (!note) {
    return next(
      new ErrorResponse(`Note not found with id of ${req.params.id}`, 404)
    );
  }

  // Check if note is ready for co-signing
  if (note.status !== 'Signed') {
    return next(
      new ErrorResponse(`Cannot co-sign a note with status: ${note.status}`, 403)
    );
  }

  // Update note
  note = await Note.findByIdAndUpdate(
    req.params.id,
    {
      status: 'Locked',
      coSignedAt: Date.now(),
      coSignedBy: req.user.id,
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
    resourceId: note._id,
    description: `Co-signed note ID: ${note._id}`,
    req
  });

  res.status(200).json({
    success: true,
    data: note
  });
});

// @desc      Get note versions
// @route     GET /api/v1/notes/:id/versions
// @access    Private
exports.getNoteVersions = asyncHandler(async (req, res, next) => {
  const note = await Note.findById(req.params.id);

  if (!note) {
    return next(
      new ErrorResponse(`Note not found with id of ${req.params.id}`, 404)
    );
  }

  const versions = await NoteVersion.find({ note: req.params.id })
    .populate({
      path: 'createdBy',
      select: 'firstName lastName'
    })
    .sort({ createdAt: -1 });

  // Log the access
  await auditLogger.log({
    user: req.user.id,
    action: 'READ',
    resourceType: 'DOCUMENTATION',
    resourceId: note._id,
    description: `Accessed version history for note ID: ${note._id}`,
    req
  });

  res.status(200).json({
    success: true,
    count: versions.length,
    data: versions
  });
});

// @desc      Get specific note version
// @route     GET /api/v1/note-versions/:id
// @access    Private
exports.getNoteVersion = asyncHandler(async (req, res, next) => {
  const version = await NoteVersion.findById(req.params.id)
    .populate({
      path: 'note',
      select: 'client provider noteType title sessionDate'
    })
    .populate({
      path: 'createdBy',
      select: 'firstName lastName'
    });

  if (!version) {
    return next(
      new ErrorResponse(`Note version not found with id of ${req.params.id}`, 404)
    );
  }

  // Log the access
  await auditLogger.log({
    user: req.user.id,
    action: 'READ',
    resourceType: 'DOCUMENTATION',
    resourceId: version.note._id,
    description: `Accessed version ID: ${version._id} for note ID: ${version.note._id}`,
    req
  });

  res.status(200).json({
    success: true,
    data: version
  });
});
