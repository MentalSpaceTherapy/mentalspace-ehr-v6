const express = require('express');
const {
  getContacts,
  getContact,
  createContact,
  updateContact,
  deleteContact,
  addContactInteraction,
  getContactStats
} = require('../controllers/contacts');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');
const advancedResults = require('../middleware/advancedResults');
const Contact = require('../models/Contact');

router
  .route('/')
  .get(
    protect,
    advancedResults(Contact, [
      { path: 'assignedTo', select: 'firstName lastName email' }
    ]),
    getContacts
  )
  .post(protect, createContact);

router
  .route('/stats')
  .get(protect, getContactStats);

router
  .route('/:id')
  .get(protect, getContact)
  .put(protect, updateContact)
  .delete(protect, authorize('PRACTICE_ADMIN', 'SYSTEM_ADMIN'), deleteContact);

router
  .route('/:id/interactions')
  .post(protect, addContactInteraction);

module.exports = router;
