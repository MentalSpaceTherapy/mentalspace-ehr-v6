const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Waitlist = require('../models/Waitlist');
const Client = require('../models/Client');
const auditLogger = require('../utils/auditLogger');

// @desc      Get all waitlist entries
// @route     GET /api/v1/waitlist
// @access    Private
exports.getWaitlist = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc      Get waitlist entry for a specific client
// @route     GET /api/v1/clients/:clientId/waitlist
// @access    Private
exports.getClientWaitlist = asyncHandler(async (req, res, next) => {
  const waitlistEntry = await Waitlist.findOne({ client: req.params.clientId, status: { $in: ['Active', 'Contacted'] } })
    .populate({
      path: 'client',
      select: 'firstName lastName phone email'
    })
    .populate({
      path: 'preferredProviders',
      select: 'firstName lastName'
    });

  // Log the access
  await auditLogger.log({
    user: req.user.id,
    action: 'READ',
    resourceType: 'CLIENT',
    description: `Accessed waitlist entry for client ID: ${req.params.clientId}`,
    req
  });

  if (!waitlistEntry) {
    return res.status(200).json({
      success: true,
      data: null
    });
  }

  res.status(200).json({
    success: true,
    data: waitlistEntry
  });
});

// @desc      Get single waitlist entry
// @route     GET /api/v1/waitlist/:id
// @access    Private
exports.getWaitlistEntry = asyncHandler(async (req, res, next) => {
  const waitlistEntry = await Waitlist.findById(req.params.id)
    .populate({
      path: 'client',
      select: 'firstName lastName phone email'
    })
    .populate({
      path: 'preferredProviders',
      select: 'firstName lastName'
    })
    .populate({
      path: 'contactAttempts.staffMember',
      select: 'firstName lastName'
    });

  if (!waitlistEntry) {
    return next(
      new ErrorResponse(`Waitlist entry not found with id of ${req.params.id}`, 404)
    );
  }

  // Log the access
  await auditLogger.log({
    user: req.user.id,
    action: 'READ',
    resourceType: 'CLIENT',
    resourceId: waitlistEntry.client._id,
    description: `Accessed waitlist entry for client: ${waitlistEntry.client.firstName} ${waitlistEntry.client.lastName}`,
    req
  });

  res.status(200).json({
    success: true,
    data: waitlistEntry
  });
});

// @desc      Create waitlist entry
// @route     POST /api/v1/clients/:clientId/waitlist
// @access    Private
exports.createWaitlistEntry = asyncHandler(async (req, res, next) => {
  // Check if client exists
  const client = await Client.findById(req.params.clientId);

  if (!client) {
    return next(
      new ErrorResponse(`Client not found with id of ${req.params.clientId}`, 404)
    );
  }

  // Check if client already has an active waitlist entry
  const existingEntry = await Waitlist.findOne({ 
    client: req.params.clientId,
    status: { $in: ['Active', 'Contacted'] }
  });

  if (existingEntry) {
    return next(
      new ErrorResponse(`Client already has an active waitlist entry`, 400)
    );
  }

  // Add client to request body
  req.body.client = req.params.clientId;
  
  // Add creator to request body
  req.body.createdBy = req.user.id;
  req.body.updatedBy = req.user.id;

  const waitlistEntry = await Waitlist.create(req.body);

  // Update client status to Waitlist
  await Client.findByIdAndUpdate(req.params.clientId, { status: 'Waitlist' });

  // Log the action
  await auditLogger.log({
    user: req.user.id,
    action: 'CREATE',
    resourceType: 'CLIENT',
    resourceId: client._id,
    description: `Added client to waitlist: ${client.firstName} ${client.lastName}`,
    req
  });

  res.status(201).json({
    success: true,
    data: waitlistEntry
  });
});

// @desc      Update waitlist entry
// @route     PUT /api/v1/waitlist/:id
// @access    Private
exports.updateWaitlistEntry = asyncHandler(async (req, res, next) => {
  let waitlistEntry = await Waitlist.findById(req.params.id);

  if (!waitlistEntry) {
    return next(
      new ErrorResponse(`Waitlist entry not found with id of ${req.params.id}`, 404)
    );
  }

  // Add updater to request body
  req.body.updatedBy = req.user.id;

  waitlistEntry = await Waitlist.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  // Log the action
  await auditLogger.log({
    user: req.user.id,
    action: 'UPDATE',
    resourceType: 'CLIENT',
    resourceId: waitlistEntry.client,
    description: `Updated waitlist entry ID: ${waitlistEntry._id}`,
    req
  });

  res.status(200).json({
    success: true,
    data: waitlistEntry
  });
});

// @desc      Add contact attempt to waitlist entry
// @route     POST /api/v1/waitlist/:id/contact-attempts
// @access    Private
exports.addContactAttempt = asyncHandler(async (req, res, next) => {
  let waitlistEntry = await Waitlist.findById(req.params.id);

  if (!waitlistEntry) {
    return next(
      new ErrorResponse(`Waitlist entry not found with id of ${req.params.id}`, 404)
    );
  }

  // Validate request
  if (!req.body.method) {
    return next(
      new ErrorResponse('Please provide contact method', 400)
    );
  }

  // Add contact attempt to waitlist entry
  const contactAttempt = {
    date: Date.now(),
    method: req.body.method,
    notes: req.body.notes || '',
    successful: req.body.successful || false,
    staffMember: req.user.id
  };

  waitlistEntry = await Waitlist.findByIdAndUpdate(
    req.params.id,
    { 
      $push: { contactAttempts: contactAttempt },
      updatedBy: req.user.id,
      updatedAt: Date.now()
    },
    { new: true, runValidators: true }
  );

  // Log the action
  await auditLogger.log({
    user: req.user.id,
    action: 'UPDATE',
    resourceType: 'CLIENT',
    resourceId: waitlistEntry.client,
    description: `Added contact attempt to waitlist entry ID: ${waitlistEntry._id}`,
    req
  });

  res.status(200).json({
    success: true,
    data: waitlistEntry
  });
});

// @desc      Remove client from waitlist
// @route     PUT /api/v1/waitlist/:id/remove
// @access    Private
exports.removeFromWaitlist = asyncHandler(async (req, res, next) => {
  let waitlistEntry = await Waitlist.findById(req.params.id);

  if (!waitlistEntry) {
    return next(
      new ErrorResponse(`Waitlist entry not found with id of ${req.params.id}`, 404)
    );
  }

  // Validate request
  if (!req.body.removalReason) {
    return next(
      new ErrorResponse('Please provide removal reason', 400)
    );
  }

  // Update waitlist entry
  waitlistEntry = await Waitlist.findByIdAndUpdate(
    req.params.id,
    {
      status: 'Removed',
      removalReason: req.body.removalReason,
      removalNotes: req.body.removalNotes || '',
      updatedBy: req.user.id,
      updatedAt: Date.now()
    },
    { new: true, runValidators: true }
  );

  // Update client status if it was Waitlist
  const client = await Client.findById(waitlistEntry.client);
  if (client && client.status === 'Waitlist') {
    if (req.body.removalReason === 'Scheduled') {
      await Client.findByIdAndUpdate(waitlistEntry.client, { status: 'Active' });
    } else {
      await Client.findByIdAndUpdate(waitlistEntry.client, { status: 'Inactive' });
    }
  }

  // Log the action
  await auditLogger.log({
    user: req.user.id,
    action: 'UPDATE',
    resourceType: 'CLIENT',
    resourceId: waitlistEntry.client,
    description: `Removed client from waitlist, reason: ${req.body.removalReason}`,
    req
  });

  res.status(200).json({
    success: true,
    data: waitlistEntry
  });
});
