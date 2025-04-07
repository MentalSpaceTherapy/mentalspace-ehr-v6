const express = require('express');
const {
  getInsurancePolicies,
  getClientInsurancePolicies,
  getInsurancePolicy,
  createInsurancePolicy,
  updateInsurancePolicy,
  deleteInsurancePolicy,
  addPolicyDocument
} = require('../controllers/insurancePolicies');

const router = express.Router({ mergeParams: true });

const { protect, authorize } = require('../middleware/auth');
const advancedResults = require('../middleware/advancedResults');
const InsurancePolicy = require('../models/InsurancePolicy');

router
  .route('/')
  .get(
    protect,
    advancedResults(InsurancePolicy, {
      path: 'client',
      select: 'firstName lastName'
    }),
    getInsurancePolicies
  )
  .post(protect, authorize('PRACTICE_ADMIN', 'CLINICIAN', 'BILLING'), createInsurancePolicy);

router
  .route('/:id')
  .get(protect, getInsurancePolicy)
  .put(protect, authorize('PRACTICE_ADMIN', 'CLINICIAN', 'BILLING'), updateInsurancePolicy)
  .delete(protect, authorize('PRACTICE_ADMIN', 'BILLING'), deleteInsurancePolicy);

router
  .route('/:id/documents')
  .post(protect, authorize('PRACTICE_ADMIN', 'CLINICIAN', 'BILLING'), addPolicyDocument);

module.exports = router;
