const express = require('express');
const {
  getAuthorizations,
  getClientAuthorizations,
  getAuthorization,
  createAuthorization,
  updateAuthorization,
  deleteAuthorization,
  verifyAuthorization,
  useAuthorizationSession
} = require('../controllers/authorizations');

const router = express.Router({ mergeParams: true });

const { protect, authorize } = require('../middleware/auth');
const advancedResults = require('../middleware/advancedResults');
const Authorization = require('../models/Authorization');

router
  .route('/')
  .get(
    protect,
    advancedResults(Authorization, [
      { path: 'client', select: 'firstName lastName' },
      { path: 'insurancePolicy', select: 'policyNumber' },
      { path: 'insuranceCarrier', select: 'name' }
    ]),
    getAuthorizations
  )
  .post(protect, authorize('PRACTICE_ADMIN', 'BILLING'), createAuthorization);

router
  .route('/:id')
  .get(protect, getAuthorization)
  .put(protect, authorize('PRACTICE_ADMIN', 'BILLING'), updateAuthorization)
  .delete(protect, authorize('PRACTICE_ADMIN', 'BILLING'), deleteAuthorization);

router
  .route('/:id/verify')
  .put(protect, authorize('PRACTICE_ADMIN', 'BILLING'), verifyAuthorization);

router
  .route('/:id/use-session')
  .put(protect, authorize('PRACTICE_ADMIN', 'BILLING', 'CLINICIAN'), useAuthorizationSession);

module.exports = router;
