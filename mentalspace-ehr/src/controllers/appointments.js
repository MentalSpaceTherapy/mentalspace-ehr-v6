const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Appointment = require('../models/Appointment');
const Client = require('../models/Client');
const Staff = require('../models/Staff');
const auditLogger = require('../utils/auditLogger');

// @desc      Get all appointments
// @route     GET /api/v1/appointments
// @access    Private
exports.getAppointments = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc      Get appointments for a specific client
// @route     GET /api/v1/clients/:clientId/appointments
// @access    Private
exports.getClientAppointments = asyncHandler(async (req, res, next) => {
  const appointments = await Appointment.find({ client: req.params.clientId })
    .populate({
      path: 'provider',
      select: 'firstName lastName'
    })
    .sort({ startTime: 1 });

  // Log the access
  await auditLogger.log({
    user: req.user.id,
    action: 'READ',
    resourceType: 'APPOINTMENT',
    description: `Accessed appointments for client ID: ${req.params.clientId}`,
    req
  });

  res.status(200).json({
    success: true,
    count: appointments.length,
    data: appointments
  });
});

// @desc      Get appointments for a specific provider
// @route     GET /api/v1/staff/:providerId/appointments
// @access    Private
exports.getProviderAppointments = asyncHandler(async (req, res, next) => {
  const appointments = await Appointment.find({ provider: req.params.providerId })
    .populate({
      path: 'client',
      select: 'firstName lastName'
    })
    .sort({ startTime: 1 });

  // Log the access
  await auditLogger.log({
    user: req.user.id,
    action: 'READ',
    resourceType: 'APPOINTMENT',
    description: `Accessed appointments for provider ID: ${req.params.providerId}`,
    req
  });

  res.status(200).json({
    success: true,
    count: appointments.length,
    data: appointments
  });
});

// @desc      Get single appointment
// @route     GET /api/v1/appointments/:id
// @access    Private
exports.getAppointment = asyncHandler(async (req, res, next) => {
  const appointment = await Appointment.findById(req.params.id)
    .populate({
      path: 'client',
      select: 'firstName lastName phone email'
    })
    .populate({
      path: 'provider',
      select: 'firstName lastName'
    });

  if (!appointment) {
    return next(
      new ErrorResponse(`Appointment not found with id of ${req.params.id}`, 404)
    );
  }

  // Log the access
  await auditLogger.log({
    user: req.user.id,
    action: 'READ',
    resourceType: 'APPOINTMENT',
    resourceId: appointment._id,
    description: `Accessed appointment details for ${appointment.client.firstName} ${appointment.client.lastName}`,
    req
  });

  res.status(200).json({
    success: true,
    data: appointment
  });
});

// @desc      Create appointment
// @route     POST /api/v1/appointments
// @access    Private
exports.createAppointment = asyncHandler(async (req, res, next) => {
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

  const appointment = await Appointment.create(req.body);

  // Log the action
  await auditLogger.log({
    user: req.user.id,
    action: 'CREATE',
    resourceType: 'APPOINTMENT',
    resourceId: appointment._id,
    description: `Created appointment for ${client.firstName} ${client.lastName} with ${provider.firstName} ${provider.lastName}`,
    req
  });

  res.status(201).json({
    success: true,
    data: appointment
  });
});

// @desc      Update appointment
// @route     PUT /api/v1/appointments/:id
// @access    Private
exports.updateAppointment = asyncHandler(async (req, res, next) => {
  let appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    return next(
      new ErrorResponse(`Appointment not found with id of ${req.params.id}`, 404)
    );
  }

  // Add updater to request body
  req.body.updatedBy = req.user.id;
  req.body.updatedAt = Date.now();

  appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  // Log the action
  await auditLogger.log({
    user: req.user.id,
    action: 'UPDATE',
    resourceType: 'APPOINTMENT',
    resourceId: appointment._id,
    description: `Updated appointment ID: ${appointment._id}`,
    req
  });

  res.status(200).json({
    success: true,
    data: appointment
  });
});

// @desc      Delete appointment
// @route     DELETE /api/v1/appointments/:id
// @access    Private
exports.deleteAppointment = asyncHandler(async (req, res, next) => {
  const appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    return next(
      new ErrorResponse(`Appointment not found with id of ${req.params.id}`, 404)
    );
  }

  await appointment.remove();

  // Log the action
  await auditLogger.log({
    user: req.user.id,
    action: 'DELETE',
    resourceType: 'APPOINTMENT',
    resourceId: appointment._id,
    description: `Deleted appointment ID: ${appointment._id}`,
    req
  });

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc      Cancel appointment
// @route     PUT /api/v1/appointments/:id/cancel
// @access    Private
exports.cancelAppointment = asyncHandler(async (req, res, next) => {
  let appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    return next(
      new ErrorResponse(`Appointment not found with id of ${req.params.id}`, 404)
    );
  }

  // Validate request
  if (!req.body.cancellationReason) {
    return next(
      new ErrorResponse('Please provide cancellation reason', 400)
    );
  }

  // Update appointment
  appointment = await Appointment.findByIdAndUpdate(
    req.params.id,
    {
      status: 'Cancelled',
      cancellationReason: req.body.cancellationReason,
      cancellationFee: req.body.cancellationFee || 0,
      updatedBy: req.user.id,
      updatedAt: Date.now()
    },
    { new: true, runValidators: true }
  );

  // Log the action
  await auditLogger.log({
    user: req.user.id,
    action: 'UPDATE',
    resourceType: 'APPOINTMENT',
    resourceId: appointment._id,
    description: `Cancelled appointment ID: ${appointment._id}, reason: ${req.body.cancellationReason}`,
    req
  });

  res.status(200).json({
    success: true,
    data: appointment
  });
});

// @desc      Mark appointment as completed
// @route     PUT /api/v1/appointments/:id/complete
// @access    Private
exports.completeAppointment = asyncHandler(async (req, res, next) => {
  let appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    return next(
      new ErrorResponse(`Appointment not found with id of ${req.params.id}`, 404)
    );
  }

  // Update appointment
  appointment = await Appointment.findByIdAndUpdate(
    req.params.id,
    {
      status: 'Completed',
      notes: req.body.notes || appointment.notes,
      updatedBy: req.user.id,
      updatedAt: Date.now()
    },
    { new: true, runValidators: true }
  );

  // Log the action
  await auditLogger.log({
    user: req.user.id,
    action: 'UPDATE',
    resourceType: 'APPOINTMENT',
    resourceId: appointment._id,
    description: `Marked appointment ID: ${appointment._id} as completed`,
    req
  });

  res.status(200).json({
    success: true,
    data: appointment
  });
});
