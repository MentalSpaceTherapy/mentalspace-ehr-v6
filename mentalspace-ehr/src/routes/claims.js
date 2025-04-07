const express = require('express');
const {
  getClaims,
  getClientClaims,
  getClaim,
  createClaim,
  updateClaim,
  deleteClaim,
  submitClaim,
  denyClaim,
  appealClaim
} = require('../controllers/claims');

const router = express.Router({ mergeParams: true });

const { protect, authorize } = require('../middleware/auth');
const advancedResults = require('../middleware/advancedResults');
const Claim = require('../models/Claim');

router
  .route('/')
  .get(
    protect,
    advancedResults(Claim, [
      { path: 'client', select: 'firstName lastName' },
      { path: 'provider', select: 'firstName lastName' },
      { path: 'insuranceCarrier', select: 'name' }
    ]),
    getClaims
  )
  .post(protect, authorize('PRACTICE_ADMIN', 'BILLING'), createClaim);

router
  .route('/:id')
  .get(protect, getClaim)
  .put(protect, authorize('PRACTICE_ADMIN', 'BILLING'), updateClaim)
  .delete(protect, authorize('PRACTICE_ADMIN', 'BILLING'), deleteClaim);

router
  .route('/:id/submit')
  .put(protect, authorize('PRACTICE_ADMIN', 'BILLING'), submitClaim);

router
  .route('/:id/deny')
  .put(protect, authorize('PRACTICE_ADMIN', 'BILLING'), denyClaim);

router
  .route('/:id/appeal')
  .put(protect, authorize('PRACTICE_ADMIN', 'BILLING'), appealClaim);

module.exports = router;
