const express = require('express');
const {
  getWaitlist,
  getClientWaitlist,
  getWaitlistEntry,
  createWaitlistEntry,
  updateWaitlistEntry,
  addContactAttempt,
  removeFromWaitlist
} = require('../controllers/waitlist');

const router = express.Router({ mergeParams: true });

const { protect, authorize } = require('../middleware/auth');
const advancedResults = require('../middleware/advancedResults');
const Waitlist = require('../models/Waitlist');

router
  .route('/')
  .get(
    protect,
    advancedResults(Waitlist, {
      path: 'client',
      select: 'firstName lastName phone email'
    }),
    getWaitlist
  )
  .post(protect, createWaitlistEntry);

router
  .route('/:id')
  .get(protect, getWaitlistEntry)
  .put(protect, updateWaitlistEntry);

router
  .route('/:id/contact-attempts')
  .post(protect, addContactAttempt);

router
  .route('/:id/remove')
  .put(protect, removeFromWaitlist);

module.exports = router;
