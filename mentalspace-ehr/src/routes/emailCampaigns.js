const express = require('express');
const {
  getEmailCampaigns,
  getEmailCampaign,
  createEmailCampaign,
  updateEmailCampaign,
  deleteEmailCampaign,
  scheduleEmailCampaign,
  sendEmailCampaign,
  cancelEmailCampaign,
  getEmailCampaignStats
} = require('../controllers/emailCampaigns');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');
const advancedResults = require('../middleware/advancedResults');
const EmailCampaign = require('../models/EmailCampaign');

router
  .route('/')
  .get(
    protect,
    advancedResults(EmailCampaign, [
      { path: 'campaign', select: 'name type status' },
      { path: 'createdBy', select: 'firstName lastName email' }
    ]),
    getEmailCampaigns
  )
  .post(protect, createEmailCampaign);

router
  .route('/stats')
  .get(protect, getEmailCampaignStats);

router
  .route('/:id')
  .get(protect, getEmailCampaign)
  .put(protect, updateEmailCampaign)
  .delete(protect, deleteEmailCampaign);

router
  .route('/:id/schedule')
  .put(protect, scheduleEmailCampaign);

router
  .route('/:id/send')
  .put(protect, authorize('PRACTICE_ADMIN', 'SYSTEM_ADMIN'), sendEmailCampaign);

router
  .route('/:id/cancel')
  .put(protect, cancelEmailCampaign);

module.exports = router;
