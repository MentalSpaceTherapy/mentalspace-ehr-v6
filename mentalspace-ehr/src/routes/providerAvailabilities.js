const express = require('express');
const {
  getProviderAvailabilities,
  getProviderAvailabilitiesForProvider,
  getProviderAvailability,
  createProviderAvailability,
  updateProviderAvailability,
  deleteProviderAvailability
} = require('../controllers/providerAvailabilities');

const router = express.Router({ mergeParams: true });

const { protect, authorize } = require('../middleware/auth');
const advancedResults = require('../middleware/advancedResults');
const ProviderAvailability = require('../models/ProviderAvailability');

router
  .route('/')
  .get(
    protect,
    advancedResults(ProviderAvailability, {
      path: 'provider',
      select: 'firstName lastName'
    }),
    getProviderAvailabilities
  )
  .post(protect, authorize('PRACTICE_ADMIN', 'CLINICIAN'), createProviderAvailability);

router
  .route('/:id')
  .get(protect, getProviderAvailability)
  .put(protect, authorize('PRACTICE_ADMIN', 'CLINICIAN'), updateProviderAvailability)
  .delete(protect, authorize('PRACTICE_ADMIN', 'CLINICIAN'), deleteProviderAvailability);

module.exports = router;
