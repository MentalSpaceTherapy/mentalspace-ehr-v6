const express = require('express');
const {
  getLeads,
  getLead,
  createLead,
  updateLead,
  deleteLead,
  addLeadInteraction,
  convertLeadToClient,
  getLeadStats
} = require('../controllers/leads');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');
const advancedResults = require('../middleware/advancedResults');
const Lead = require('../models/Lead');

router
  .route('/')
  .get(
    protect,
    advancedResults(Lead, [
      { path: 'assignedTo', select: 'firstName lastName email' },
      { path: 'preferredProvider', select: 'firstName lastName' }
    ]),
    getLeads
  )
  .post(protect, createLead);

router
  .route('/stats')
  .get(protect, getLeadStats);

router
  .route('/:id')
  .get(protect, getLead)
  .put(protect, updateLead)
  .delete(protect, authorize('PRACTICE_ADMIN', 'SYSTEM_ADMIN'), deleteLead);

router
  .route('/:id/interactions')
  .post(protect, addLeadInteraction);

router
  .route('/:id/convert')
  .post(protect, convertLeadToClient);

module.exports = router;
