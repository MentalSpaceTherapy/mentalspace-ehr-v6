const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Message = require('../models/Message');
const MessageThread = require('../models/MessageThread');
const MessageReadReceipt = require('../models/MessageReadReceipt');
const MessageNotification = require('../models/MessageNotification');
const Staff = require('../models/Staff');
const Client = require('../models/Client');
const auditLogger = require('../utils/auditLogger');

// @desc      Get all messages
// @route     GET /api/v1/messages
// @access    Private
exports.getMessages = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc      Get messages for a specific thread
// @route     GET /api/v1/message-threads/:threadId/messages
// @access    Private
exports.getThreadMessages = asyncHandler(async (req, res, next) => {
  const thread = await MessageThread.findById(req.params.threadId);
  
  if (!thread) {
    return next(
      new ErrorResponse(`Message thread not found with id of ${req.params.threadId}`, 404)
    );
  }

  // Check if user is a participant in the thread
  const isParticipant = thread.participants.some(p => 
    p.participant.toString() === req.user.id && 
    p.participantModel === 'Staff' && 
    p.isActive
  );

  if (!isParticipant && req.user.role !== 'PRACTICE_ADMIN' && req.user.role !== 'SYSTEM_ADMIN') {
    return next(
      new ErrorResponse(`Not authorized to access messages in this thread`, 403)
    );
  }

  const messages = await Message.find({ thread: req.params.threadId })
    .populate({
      path: 'sender',
      select: 'firstName lastName role email',
      model: function(doc) {
        return doc.senderModel;
      }
    })
    .populate({
      path: 'recipient',
      select: 'firstName lastName role email',
      model: function(doc) {
        return doc.recipientModel;
      }
    })
    .sort({ createdAt: 1 });

  // Log the access
  await auditLogger.log({
    user: req.user.id,
    action: 'READ',
    resourceType: 'MESSAGING',
    resourceId: req.params.threadId,
    description: `Accessed messages in thread ID: ${req.params.threadId}`,
    req
  });

  res.status(200).json({
    success: true,
    count: messages.length,
    data: messages
  });
});

// @desc      Get single message
// @route     GET /api/v1/messages/:id
// @access    Private
exports.getMessage = asyncHandler(async (req, res, next) => {
  const message = await Message.findById(req.params.id)
    .populate({
      path: 'sender',
      select: 'firstName lastName role email',
      model: function(doc) {
        return doc.senderModel;
      }
    })
    .populate({
      path: 'recipient',
      select: 'firstName lastName role email',
      model: function(doc) {
        return doc.recipientModel;
      }
    })
    .populate({
      path: 'thread',
      select: 'title type category status'
    });

  if (!message) {
    return next(
      new ErrorResponse(`Message not found with id of ${req.params.id}`, 404)
    );
  }

  // Check if user is sender or recipient or has admin access
  const isAuthorized = 
    (message.sender.toString() === req.user.id && message.senderModel === 'Staff') ||
    (message.recipient.toString() === req.user.id && message.recipientModel === 'Staff') ||
    req.user.role === 'PRACTICE_ADMIN' || 
    req.user.role === 'SYSTEM_ADMIN';

  if (!isAuthorized) {
    return next(
      new ErrorResponse(`Not authorized to access this message`, 403)
    );
  }

  // Log the access
  await auditLogger.log({
    user: req.user.id,
    action: 'READ',
    resourceType: 'MESSAGING',
    resourceId: message._id,
    description: `Accessed message ID: ${message._id}`,
    req
  });

  // If user is recipient and message is not read, mark as read
  if (message.recipient.toString() === req.user.id && 
      message.recipientModel === 'Staff' && 
      !message.isRead) {
    
    message.isRead = true;
    message.readAt = Date.now();
    message.status = 'Read';
    await message.save();

    // Create read receipt
    await MessageReadReceipt.create({
      message: message._id,
      reader: req.user.id,
      readerModel: 'Staff',
      readAt: Date.now(),
      deviceInfo: req.headers['user-agent'],
      ipAddress: req.ip
    });
  }

  res.status(200).json({
    success: true,
    data: message
  });
});

// @desc      Create message
// @route     POST /api/v1/messages
// @access    Private
exports.createMessage = asyncHandler(async (req, res, next) => {
  // Check if thread exists
  const thread = await MessageThread.findById(req.body.thread);
  if (!thread) {
    return next(
      new ErrorResponse(`Message thread not found with id of ${req.body.thread}`, 404)
    );
  }

  // Check if user is a participant in the thread
  const isParticipant = thread.participants.some(p => 
    p.participant.toString() === req.user.id && 
    p.participantModel === 'Staff' && 
    p.isActive
  );

  if (!isParticipant) {
    return next(
      new ErrorResponse(`Not authorized to send messages in this thread`, 403)
    );
  }

  // Set sender to current user
  req.body.sender = req.user.id;
  req.body.senderModel = 'Staff';

  // Validate recipient
  if (req.body.recipientModel === 'Staff') {
    const staff = await Staff.findById(req.body.recipient);
    if (!staff) {
      return next(
        new ErrorResponse(`Staff recipient not found with id of ${req.body.recipient}`, 404)
      );
    }
    
    // Check if recipient is a participant in the thread
    const isRecipientParticipant = thread.participants.some(p => 
      p.participant.toString() === req.body.recipient && 
      p.participantModel === 'Staff' && 
      p.isActive
    );

    if (!isRecipientParticipant) {
      return next(
        new ErrorResponse(`Recipient is not a participant in this thread`, 400)
      );
    }
  } else if (req.body.recipientModel === 'Client') {
    const client = await Client.findById(req.body.recipient);
    if (!client) {
      return next(
        new ErrorResponse(`Client recipient not found with id of ${req.body.recipient}`, 404)
      );
    }
    
    // Check if recipient is a participant in the thread
    const isRecipientParticipant = thread.participants.some(p => 
      p.participant.toString() === req.body.recipient && 
      p.participantModel === 'Client' && 
      p.isActive
    );

    if (!isRecipientParticipant) {
      return next(
        new ErrorResponse(`Recipient is not a participant in this thread`, 400)
      );
    }
  }

  const message = await Message.create(req.body);

  // Update thread with last message time and add message to thread
  thread.lastMessageAt = Date.now();
  thread.messages.push(message._id);
  await thread.save();

  // Create notification for recipient
  await MessageNotification.create({
    recipient: req.body.recipient,
    recipientModel: req.body.recipientModel,
    message: message._id,
    thread: thread._id,
    type: req.body.isUrgent ? 'Urgent Message' : 'New Message',
    title: `New message from ${req.user.firstName} ${req.user.lastName}`,
    content: req.body.content.substring(0, 100) + (req.body.content.length > 100 ? '...' : ''),
    priority: req.body.isUrgent ? 'Urgent' : 'Normal',
    deliveryMethods: ['In-App']
  });

  // Log the action
  await auditLogger.log({
    user: req.user.id,
    action: 'CREATE',
    resourceType: 'MESSAGING',
    resourceId: message._id,
    description: `Sent message in thread: ${thread.title}`,
    req
  });

  res.status(201).json({
    success: true,
    data: message
  });
});

// @desc      Update message (limited functionality)
// @route     PUT /api/v1/messages/:id
// @access    Private
exports.updateMessage = asyncHandler(async (req, res, next) => {
  let message = await Message.findById(req.params.id);

  if (!message) {
    return next(
      new ErrorResponse(`Message not found with id of ${req.params.id}`, 404)
    );
  }

  // Check if user is the sender
  if (message.sender.toString() !== req.user.id || message.senderModel !== 'Staff') {
    return next(
      new ErrorResponse(`Not authorized to update this message`, 403)
    );
  }

  // Only allow updating isUrgent flag
  if (Object.keys(req.body).some(key => key !== 'isUrgent')) {
    return next(
      new ErrorResponse(`Only isUrgent flag can be updated`, 400)
    );
  }

  message = await Message.findByIdAndUpdate(req.params.id, { isUrgent: req.body.isUrgent }, {
    new: true,
    runValidators: true
  });

  // If marking as urgent, update notification
  if (req.body.isUrgent) {
    await MessageNotification.findOneAndUpdate(
      { message: message._id },
      { 
        type: 'Urgent Message',
        priority: 'Urgent'
      }
    );
  }

  // Log the action
  await auditLogger.log({
    user: req.user.id,
    action: 'UPDATE',
    resourceType: 'MESSAGING',
    resourceId: message._id,
    description: `Updated message urgency status to: ${req.body.isUrgent}`,
    req
  });

  res.status(200).json({
    success: true,
    data: message
  });
});

// @desc      Delete message
// @route     DELETE /api/v1/messages/:id
// @access    Private
exports.deleteMessage = asyncHandler(async (req, res, next) => {
  const message = await Message.findById(req.params.id);

  if (!message) {
    return next(
      new ErrorResponse(`Message not found with id of ${req.params.id}`, 404)
    );
  }

  // Check if user is the sender or has admin access
  const isAuthorized = 
    (message.sender.toString() === req.user.id && message.senderModel === 'Staff') ||
    req.user.role === 'PRACTICE_ADMIN' || 
    req.user.role === 'SYSTEM_ADMIN';

  if (!isAuthorized) {
    return next(
      new ErrorResponse(`Not authorized to delete this message`, 403)
    );
  }

  // Remove message from thread
  await MessageThread.findByIdAndUpdate(
    message.thread,
    { $pull: { messages: message._id } }
  );

  // Delete related read receipts
  await MessageReadReceipt.deleteMany({ message: message._id });

  // Delete related notifications
  await MessageNotification.deleteMany({ message: message._id });

  await message.remove();

  // Log the action
  await auditLogger.log({
    user: req.user.id,
    action: 'DELETE',
    resourceType: 'MESSAGING',
    resourceId: message._id,
    description: `Deleted message ID: ${message._id}`,
    req
  });

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc      Mark message as read
// @route     PUT /api/v1/messages/:id/read
// @access    Private
exports.markMessageAsRead = asyncHandler(async (req, res, next) => {
  const message = await Message.findById(req.params.id);

  if (!message) {
    return next(
      new ErrorResponse(`Message not found with id of ${req.params.id}`, 404)
    );
  }

  // Check if user is the recipient
  if (message.recipient.toString() !== req.user.id || message.recipientModel !== 'Staff') {
    return next(
      new ErrorResponse(`Not authorized to mark this message as read`, 403)
    );
  }

  // Update message
  message.isRead = true;
  message.readAt = Date.now();
  message.status = 'Read';
  await message.save();

  // Create read receipt
  const readReceipt = await MessageReadReceipt.create({
    message: message._id,
    reader: req.user.id,
    readerModel: 'Staff',
    readAt: Date.now(),
    deviceInfo: req.headers['user-agent'],
    ipAddress: req.ip
  });

  // Add read receipt to message
  message.readReceipts.push(readReceipt._id);
  await message.save();

  // Update notification
  await MessageNotification.findOneAndUpdate(
    { 
      message: message._id,
      recipient: req.user.id,
      recipientModel: 'Staff'
    },
    { 
      isRead: true,
      readAt: Date.now()
    }
  );

  // Log the action
  await auditLogger.log({
    user: req.user.id,
    action: 'UPDATE',
    resourceType: 'MESSAGING',
    resourceId: message._id,
    description: `Marked message as read`,
    req
  });

  res.status(200).json({
    success: true,
    data: message
  });
});
