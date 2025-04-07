const express = require('express');
const {
  getMessageThreads,
  getMessageThread,
  createMessageThread,
  updateMessageThread,
  addParticipant,
  removeParticipant,
  archiveThread,
  reactivateThread
} = require('../controllers/messageThreads');

// Include message routes
const messageRouter = require('./messages');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');
const advancedResults = require('../middleware/advancedResults');
const MessageThread = require('../models/MessageThread');

// Re-route into other resource routers
router.use('/:threadId/messages', messageRouter);

router
  .route('/')
  .get(
    protect,
    advancedResults(MessageThread, [
      { 
        path: 'participants.participant',
        select: 'firstName lastName role email',
        model: function(doc) {
          return doc.participants.participantModel;
        }
      },
      {
        path: 'client',
        select: 'firstName lastName'
      }
    ]),
    getMessageThreads
  )
  .post(protect, createMessageThread);

router
  .route('/:id')
  .get(protect, getMessageThread)
  .put(protect, updateMessageThread);

router
  .route('/:id/participants')
  .put(protect, addParticipant);

router
  .route('/:id/participants/:participantId')
  .put(protect, removeParticipant);

router
  .route('/:id/archive')
  .put(protect, archiveThread);

router
  .route('/:id/reactivate')
  .put(protect, reactivateThread);

module.exports = router;
