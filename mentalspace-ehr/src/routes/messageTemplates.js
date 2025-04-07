const express = require('express');
const {
  getMessageTemplates,
  getMessageTemplate,
  createMessageTemplate,
  updateMessageTemplate,
  deleteMessageTemplate,
  applyTemplate
} = require('../controllers/messageTemplates');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');
const advancedResults = require('../middleware/advancedResults');
const MessageTemplate = require('../models/MessageTemplate');

router
  .route('/')
  .get(
    protect,
    advancedResults(MessageTemplate, {
      path: 'createdBy',
      select: 'firstName lastName'
    }),
    getMessageTemplates
  )
  .post(protect, authorize('PRACTICE_ADMIN', 'SYSTEM_ADMIN'), createMessageTemplate);

router
  .route('/:id')
  .get(protect, getMessageTemplate)
  .put(protect, authorize('PRACTICE_ADMIN', 'SYSTEM_ADMIN'), updateMessageTemplate)
  .delete(protect, authorize('PRACTICE_ADMIN', 'SYSTEM_ADMIN'), deleteMessageTemplate);

router
  .route('/:id/apply')
  .post(protect, applyTemplate);

module.exports = router;
