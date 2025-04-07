const express = require('express');
const {
  getNotifications,
  getUnreadCount,
  getNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteReadNotifications
} = require('../controllers/messageNotifications');

const router = express.Router();

const { protect } = require('../middleware/auth');
const advancedResults = require('../middleware/advancedResults');
const MessageNotification = require('../models/MessageNotification');

router
  .route('/')
  .get(
    protect,
    advancedResults(MessageNotification, [
      {
        path: 'message',
        select: 'subject content createdAt'
      },
      {
        path: 'thread',
        select: 'title type category'
      }
    ]),
    getNotifications
  );

router
  .route('/unread-count')
  .get(protect, getUnreadCount);

router
  .route('/mark-all-read')
  .put(protect, markAllAsRead);

router
  .route('/delete-read')
  .delete(protect, deleteReadNotifications);

router
  .route('/:id')
  .get(protect, getNotification)
  .delete(protect, deleteNotification);

router
  .route('/:id/read')
  .put(protect, markAsRead);

module.exports = router;
