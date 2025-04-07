const express = require('express');
const {
  getCampaigns,
  getCampaign,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  addCampaignRecipients,
  removeCampaignRecipient,
  getCampaignStats
} = require('../controllers/campaigns');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');
const advancedResults = require('../middleware/advancedResults');
const Campaign = require('../models/Campaign');

router
  .route('/')
  .get(
    protect,
    advancedResults(Campaign, [
      { path: 'assignedTo', select: 'firstName lastName email' }
    ]),
    getCampaigns
  )
  .post(protect, createCampaign);

router
  .route('/stats')
  .get(protect, getCampaignStats);

router
  .route('/:id')
  .get(protect, getCampaign)
  .put(protect, updateCampaign)
  .delete(protect, authorize('PRACTICE_ADMIN', 'SYSTEM_ADMIN'), deleteCampaign);

router
  .route('/:id/recipients')
  .put(protect, addCampaignRecipients);

router
  .route('/:id/recipients/:type/:recipientId')
  .delete(protect, removeCampaignRecipient);

module.exports = router;
