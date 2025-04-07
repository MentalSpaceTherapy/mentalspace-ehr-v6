const express = require('express');
const {
  getMessages,
  getThreadMessages,
  getMessage,
  createMessage,
  updateMessage,
  deleteMessage,
  markMessageAsRead
} = require('../controllers/messages');

const router = express.Router({ mergeParams: true });

const { protect, authorize } = require('../middleware/auth');
const advancedResults = require('../middleware/advancedResults');
const Message = require('../models/Message');

router
  .route('/')
  .get(
    protect,
    advancedResults(Message, [
      { 
        path: 'sender',
        select: 'firstName lastName role',
        model: function(doc) {
          return doc.senderModel;
        }
      },
      { 
        path: 'recipient',
        select: 'firstName lastName role',
        model: function(doc) {
          return doc.recipientModel;
        }
      },
      {
        path: 'thread',
        select: 'title type category'
      }
    ]),
    getMessages
  )
  .post(protect, createMessage);

router
  .route('/:id')
  .get(protect, getMessage)
  .put(protect, updateMessage)
  .delete(protect, deleteMessage);

router
  .route('/:id/read')
  .put(protect, markMessageAsRead);

module.exports = router;
