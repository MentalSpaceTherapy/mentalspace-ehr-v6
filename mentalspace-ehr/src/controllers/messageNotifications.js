const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const MessageNotification = require('../models/MessageNotification');
const auditLogger = require('../utils/auditLogger');

// @desc      Get all notifications for current user
// @route     GET /api/v1/message-notifications
// @access    Private
exports.getNotifications = asyncHandler(async (req, res, next) => {
  // Filter to only show notifications for current user
  if (!req.advancedResults.filter) {
    req.advancedResults.filter = {};
  }
  
  req.advancedResults.filter.recipient = req.user.id;
  req.advancedResults.filter.recipientModel = 'Staff';
  
  res.status(200).json(res.advancedResults);
});

// @desc      Get unread notifications count for current user
// @route     GET /api/v1/message-notifications/unread-count
// @access    Private
exports.getUnreadCount = asyncHandler(async (req, res, next) => {
  const count = await MessageNotification.countDocuments({
    recipient: req.user.id,
    recipientModel: 'Staff',
    isRead: false
  });

  res.status(200).json({
    success: true,
    data: { count }
  });
});

// @desc      Get single notification
// @route     GET /api/v1/message-notifications/:id
// @access    Private
exports.getNotification = asyncHandler(async (req, res, next) => {
  const notification = await MessageNotification.findById(req.params.id)
    .populate({
      path: 'message',
      select: 'subject content createdAt'
    })
    .populate({
      path: 'thread',
      select: 'title type category'
    });

  if (!notification) {
    return next(
      new ErrorResponse(`Notification not found with id of ${req.params.id}`, 404)
    );
  }

  // Check if user is the recipient
  if (notification.recipient.toString() !== req.user.id || notification.recipientModel !== 'Staff') {
    return next(
      new ErrorResponse(`Not authorized to access this notification`, 403)
    );
  }

  // Log the access
  await auditLogger.log({
    user: req.user.id,
    action: 'READ',
    resourceType: 'MESSAGING',
    resourceId: notification._id,
    description: `Accessed notification ID: ${notification._id}`,
    req
  });

  // If notification is not read, mark as read
  if (!notification.isRead) {
    notification.isRead = true;
    notification.readAt = Date.now();
    await notification.save();
  }

  res.status(200).json({
    success: true,
    data: notification
  });
});

// @desc      Mark notification as read
// @route     PUT /api/v1/message-notifications/:id/read
// @access    Private
exports.markAsRead = asyncHandler(async (req, res, next) => {
  const notification = await MessageNotification.findById(req.params.id);

  if (!notification) {
    return next(
      new ErrorResponse(`Notification not found with id of ${req.params.id}`, 404)
    );
  }

  // Check if user is the recipient
  if (notification.recipient.toString() !== req.user.id || notification.recipientModel !== 'Staff') {
    return next(
      new ErrorResponse(`Not authorized to update this notification`, 403)
    );
  }

  // Update notification
  notification.isRead = true;
  notification.readAt = Date.now();
  await notification.save();

  // Log the action
  await auditLogger.log({
    user: req.user.id,
    action: 'UPDATE',
    resourceType: 'MESSAGING',
    resourceId: notification._id,
    description: `Marked notification as read`,
    req
  });

  res.status(200).json({
    success: true,
    data: notification
  });
});

// @desc      Mark all notifications as read
// @route     PUT /api/v1/message-notifications/mark-all-read
// @access    Private
exports.markAllAsRead = asyncHandler(async (req, res, next) => {
  const result = await MessageNotification.updateMany(
    {
      recipient: req.user.id,
      recipientModel: 'Staff',
      isRead: false
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
    description: `Marked all notifications as read`,
    req
  });

  res.status(200).json({
    success: true,
    data: {
      count: result.nModified
    }
  });
});

// @desc      Delete notification
// @route     DELETE /api/v1/message-notifications/:id
// @access    Private
exports.deleteNotification = asyncHandler(async (req, res, next) => {
  const notification = await MessageNotification.findById(req.params.id);

  if (!notification) {
    return next(
      new ErrorResponse(`Notification not found with id of ${req.params.id}`, 404)
    );
  }

  // Check if user is the recipient
  if (notification.recipient.toString() !== req.user.id || notification.recipientModel !== 'Staff') {
    return next(
      new ErrorResponse(`Not authorized to delete this notification`, 403)
    );
  }

  await notification.remove();

  // Log the action
  await auditLogger.log({
    user: req.user.id,
    action: 'DELETE',
    resourceType: 'MESSAGING',
    resourceId: notification._id,
    description: `Deleted notification ID: ${notification._id}`,
    req
  });

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc      Delete all read notifications
// @route     DELETE /api/v1/message-notifications/delete-read
// @access    Private
exports.deleteReadNotifications = asyncHandler(async (req, res, next) => {
  const result = await MessageNotification.deleteMany({
    recipient: req.user.id,
    recipientModel: 'Staff',
    isRead: true
  });

  // Log the action
  await auditLogger.log({
    user: req.user.id,
    action: 'DELETE',
    resourceType: 'MESSAGING',
    description: `Deleted all read notifications`,
    req
  });

  res.status(200).json({
    success: true,
    data: {
      count: result.deletedCount
    }
  });
});
