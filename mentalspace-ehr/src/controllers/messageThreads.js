const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const MessageThread = require('../models/MessageThread');
const Message = require('../models/Message');
const MessageNotification = require('../models/MessageNotification');
const Staff = require('../models/Staff');
const Client = require('../models/Client');
const auditLogger = require('../utils/auditLogger');

// @desc      Get all message threads
// @route     GET /api/v1/message-threads
// @access    Private
exports.getMessageThreads = asyncHandler(async (req, res, next) => {
  // Custom filter to only show threads where user is a participant
  if (!req.advancedResults.filter) {
    req.advancedResults.filter = {};
  }
  
  if (req.user.role !== 'PRACTICE_ADMIN' && req.user.role !== 'SYSTEM_ADMIN') {
    req.advancedResults.filter['participants.participant'] = req.user.id;
    req.advancedResults.filter['participants.participantModel'] = 'Staff';
    req.advancedResults.filter['participants.isActive'] = true;
  }
  
  res.status(200).json(res.advancedResults);
});

// @desc      Get single message thread
// @route     GET /api/v1/message-threads/:id
// @access    Private
exports.getMessageThread = asyncHandler(async (req, res, next) => {
  const thread = await MessageThread.findById(req.params.id)
    .populate({
      path: 'participants.participant',
      select: 'firstName lastName email role',
      model: function(doc) {
        return doc.participants.participantModel;
      }
    })
    .populate({
      path: 'client',
      select: 'firstName lastName email phone'
    })
    .populate({
      path: 'createdBy',
      select: 'firstName lastName email role',
      model: function(doc) {
        return doc.createdByModel;
      }
    });

  if (!thread) {
    return next(
      new ErrorResponse(`Message thread not found with id of ${req.params.id}`, 404)
    );
  }

  // Check if user is a participant in the thread or has admin access
  const isParticipant = thread.participants.some(p => 
    p.participant._id.toString() === req.user.id && 
    p.participantModel === 'Staff' && 
    p.isActive
  );

  if (!isParticipant && req.user.role !== 'PRACTICE_ADMIN' && req.user.role !== 'SYSTEM_ADMIN') {
    return next(
      new ErrorResponse(`Not authorized to access this message thread`, 403)
    );
  }

  // Log the access
  await auditLogger.log({
    user: req.user.id,
    action: 'READ',
    resourceType: 'MESSAGING',
    resourceId: thread._id,
    description: `Accessed message thread: ${thread.title}`,
    req
  });

  res.status(200).json({
    success: true,
    data: thread
  });
});

// @desc      Create message thread
// @route     POST /api/v1/message-threads
// @access    Private
exports.createMessageThread = asyncHandler(async (req, res, next) => {
  // Add creator to request body
  req.body.createdBy = req.user.id;
  req.body.createdByModel = 'Staff';

  // Ensure current user is added as a participant
  if (!req.body.participants) {
    req.body.participants = [];
  }
  
  // Check if current user is already in participants
  const currentUserParticipant = req.body.participants.find(
    p => p.participant === req.user.id && p.participantModel === 'Staff'
  );
  
  if (!currentUserParticipant) {
    req.body.participants.push({
      participant: req.user.id,
      participantModel: 'Staff',
      role: 'Owner',
      isActive: true,
      joinedAt: Date.now()
    });
  } else {
    // Ensure current user is an owner
    currentUserParticipant.role = 'Owner';
  }

  // Validate participants
  for (const participant of req.body.participants) {
    if (participant.participantModel === 'Staff') {
      const staff = await Staff.findById(participant.participant);
      if (!staff) {
        return next(
          new ErrorResponse(`Staff participant not found with id of ${participant.participant}`, 404)
        );
      }
    } else if (participant.participantModel === 'Client') {
      const client = await Client.findById(participant.participant);
      if (!client) {
        return next(
          new ErrorResponse(`Client participant not found with id of ${participant.participant}`, 404)
        );
      }
      
      // If thread has a client participant, set the client field
      if (!req.body.client) {
        req.body.client = participant.participant;
      }
    }
  }

  const thread = await MessageThread.create(req.body);

  // Log the action
  await auditLogger.log({
    user: req.user.id,
    action: 'CREATE',
    resourceType: 'MESSAGING',
    resourceId: thread._id,
    description: `Created message thread: ${thread.title}`,
    req
  });

  res.status(201).json({
    success: true,
    data: thread
  });
});

// @desc      Update message thread
// @route     PUT /api/v1/message-threads/:id
// @access    Private
exports.updateMessageThread = asyncHandler(async (req, res, next) => {
  let thread = await MessageThread.findById(req.params.id);

  if (!thread) {
    return next(
      new ErrorResponse(`Message thread not found with id of ${req.params.id}`, 404)
    );
  }

  // Check if user is an owner or has admin access
  const isOwner = thread.participants.some(p => 
    p.participant.toString() === req.user.id && 
    p.participantModel === 'Staff' && 
    p.role === 'Owner' && 
    p.isActive
  );

  if (!isOwner && req.user.role !== 'PRACTICE_ADMIN' && req.user.role !== 'SYSTEM_ADMIN') {
    return next(
      new ErrorResponse(`Not authorized to update this message thread`, 403)
    );
  }

  // Prevent updating certain fields
  if (req.body.participants || req.body.messages || req.body.createdBy || req.body.createdByModel) {
    return next(
      new ErrorResponse(`Cannot update participants, messages, or creator directly`, 400)
    );
  }

  thread = await MessageThread.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  // Log the action
  await auditLogger.log({
    user: req.user.id,
    action: 'UPDATE',
    resourceType: 'MESSAGING',
    resourceId: thread._id,
    description: `Updated message thread: ${thread.title}`,
    req
  });

  res.status(200).json({
    success: true,
    data: thread
  });
});

// @desc      Add participant to thread
// @route     PUT /api/v1/message-threads/:id/participants
// @access    Private
exports.addParticipant = asyncHandler(async (req, res, next) => {
  let thread = await MessageThread.findById(req.params.id);

  if (!thread) {
    return next(
      new ErrorResponse(`Message thread not found with id of ${req.params.id}`, 404)
    );
  }

  // Check if user is an owner or has admin access
  const isOwner = thread.participants.some(p => 
    p.participant.toString() === req.user.id && 
    p.participantModel === 'Staff' && 
    p.role === 'Owner' && 
    p.isActive
  );

  if (!isOwner && req.user.role !== 'PRACTICE_ADMIN' && req.user.role !== 'SYSTEM_ADMIN') {
    return next(
      new ErrorResponse(`Not authorized to add participants to this thread`, 403)
    );
  }

  // Validate new participant
  if (!req.body.participant || !req.body.participantModel) {
    return next(
      new ErrorResponse('Please provide participant ID and model', 400)
    );
  }

  // Check if participant already exists
  const existingParticipant = thread.participants.find(
    p => p.participant.toString() === req.body.participant && 
         p.participantModel === req.body.participantModel
  );

  if (existingParticipant) {
    if (existingParticipant.isActive) {
      return next(
        new ErrorResponse('Participant already exists in this thread', 400)
      );
    } else {
      // Reactivate participant
      existingParticipant.isActive = true;
      existingParticipant.leftAt = undefined;
      existingParticipant.joinedAt = Date.now();
      await thread.save();
      
      // Log the action
      await auditLogger.log({
        user: req.user.id,
        action: 'UPDATE',
        resourceType: 'MESSAGING',
        resourceId: thread._id,
        description: `Reactivated participant in thread: ${thread.title}`,
        req
      });
      
      return res.status(200).json({
        success: true,
        data: thread
      });
    }
  }

  // Validate participant exists
  if (req.body.participantModel === 'Staff') {
    const staff = await Staff.findById(req.body.participant);
    if (!staff) {
      return next(
        new ErrorResponse(`Staff not found with id of ${req.body.participant}`, 404)
      );
    }
  } else if (req.body.participantModel === 'Client') {
    const client = await Client.findById(req.body.participant);
    if (!client) {
      return next(
        new ErrorResponse(`Client not found with id of ${req.body.participant}`, 404)
      );
    }
  }

  // Add new participant
  thread.participants.push({
    participant: req.body.participant,
    participantModel: req.body.participantModel,
    role: req.body.role || 'Member',
    isActive: true,
    joinedAt: Date.now()
  });

  await thread.save();

  // Log the action
  await auditLogger.log({
    user: req.user.id,
    action: 'UPDATE',
    resourceType: 'MESSAGING',
    resourceId: thread._id,
    description: `Added participant to thread: ${thread.title}`,
    req
  });

  res.status(200).json({
    success: true,
    data: thread
  });
});

// @desc      Remove participant from thread
// @route     PUT /api/v1/message-threads/:id/participants/:participantId
// @access    Private
exports.removeParticipant = asyncHandler(async (req, res, next) => {
  let thread = await MessageThread.findById(req.params.id);

  if (!thread) {
    return next(
      new ErrorResponse(`Message thread not found with id of ${req.params.id}`, 404)
    );
  }

  // Check if user is an owner or has admin access or is removing themselves
  const isOwner = thread.participants.some(p => 
    p.participant.toString() === req.user.id && 
    p.participantModel === 'Staff' && 
    p.role === 'Owner' && 
    p.isActive
  );

  const isSelfRemoval = req.params.participantId === req.user.id;

  if (!isOwner && !isSelfRemoval && req.user.role !== 'PRACTICE_ADMIN' && req.user.role !== 'SYSTEM_ADMIN') {
    return next(
      new ErrorResponse(`Not authorized to remove participants from this thread`, 403)
    );
  }

  // Find participant
  const participantIndex = thread.participants.findIndex(
    p => p.participant.toString() === req.params.participantId && p.isActive
  );

  if (participantIndex === -1) {
    return next(
      new ErrorResponse(`Participant not found in this thread`, 404)
    );
  }

  // Don't allow removing the last owner
  if (thread.participants[participantIndex].role === 'Owner') {
    const ownerCount = thread.participants.filter(
      p => p.role === 'Owner' && p.isActive
    ).length;

    if (ownerCount <= 1) {
      return next(
        new ErrorResponse(`Cannot remove the last owner from the thread`, 400)
      );
    }
  }

  // Mark participant as inactive instead of removing
  thread.participants[participantIndex].isActive = false;
  thread.participants[participantIndex].leftAt = Date.now();
  
  await thread.save();

  // Log the action
  await auditLogger.log({
    user: req.user.id,
    action: 'UPDATE',
    resourceType: 'MESSAGING',
    resourceId: thread._id,
    description: `Removed participant from thread: ${thread.title}`,
    req
  });

  res.status(200).json({
    success: true,
    data: thread
  });
});

// @desc      Archive message thread
// @route     PUT /api/v1/message-threads/:id/archive
// @access    Private
exports.archiveThread = asyncHandler(async (req, res, next) => {
  let thread = await MessageThread.findById(req.params.id);

  if (!thread) {
    return next(
      new ErrorResponse(`Message thread not found with id of ${req.params.id}`, 404)
    );
  }

  // Check if user is a participant or has admin access
  const isParticipant = thread.participants.some(p => 
    p.participant.toString() === req.user.id && 
    p.participantModel === 'Staff' && 
    p.isActive
  );

  if (!isParticipant && req.user.role !== 'PRACTICE_ADMIN' && req.user.role !== 'SYSTEM_ADMIN') {
    return next(
      new ErrorResponse(`Not authorized to archive this thread`, 403)
    );
  }

  thread = await MessageThread.findByIdAndUpdate(
    req.params.id,
    { status: 'Archived' },
    { new: true }
  );

  // Log the action
  await auditLogger.log({
    user: req.user.id,
    action: 'UPDATE',
    resourceType: 'MESSAGING',
    resourceId: thread._id,
    description: `Archived message thread: ${thread.title}`,
    req
  });

  res.status(200).json({
    success: true,
    data: thread
  });
});

// @desc      Reactivate archived message thread
// @route     PUT /api/v1/message-threads/:id/reactivate
// @access    Private
exports.reactivateThread = asyncHandler(async (req, res, next) => {
  let thread = await MessageThread.findById(req.params.id);

  if (!thread) {
    return next(
      new ErrorResponse(`Message thread not found with id of ${req.params.id}`, 404)
    );
  }

  // Check if thread is archived
  if (thread.status !== 'Archived') {
    return next(
      new ErrorResponse(`Thread is not archived`, 400)
    );
  }

  // Check if user is a participant or has admin access
  const isParticipant = thread.participants.some(p => 
    p.participant.toString() === req.user.id && 
    p.participantModel === 'Staff' && 
    p.isActive
  );

  if (!isParticipant && req.user.role !== 'PRACTICE_ADMIN' && req.user.role !== 'SYSTEM_ADMIN') {
    return next(
      new ErrorResponse(`Not authorized to reactivate this thread`, 403)
    );
  }

  thread = await MessageThread.findByIdAndUpdate(
    req.params.id,
    { status: 'Active' },
    { new: true }
  );

  // Log the action
  await auditLogger.log({
    user: req.user.id,
    action: 'UPDATE',
    resourceType: 'MESSAGING',
    resourceId: thread._id,
    description: `Reactivated message thread: ${thread.title}`,
    req
  });

  res.status(200).json({
    success: true,
    data: thread
  });
});
