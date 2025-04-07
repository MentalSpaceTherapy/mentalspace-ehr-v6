const express = require('express');
const {
  getRiskAssessments,
  getClientRiskAssessments,
  getRiskAssessment,
  createRiskAssessment,
  updateRiskAssessment,
  deleteRiskAssessment,
  getLatestRiskAssessment
} = require('../controllers/riskAssessments');

const router = express.Router({ mergeParams: true });

const { protect, authorize } = require('../middleware/auth');
const advancedResults = require('../middleware/advancedResults');
const RiskAssessment = require('../models/RiskAssessment');

router
  .route('/')
  .get(
    protect,
    advancedResults(RiskAssessment, [
      { path: 'client', select: 'firstName lastName' },
      { path: 'provider', select: 'firstName lastName' }
    ]),
    getRiskAssessments
  )
  .post(protect, authorize('PRACTICE_ADMIN', 'CLINICIAN', 'INTERN', 'SUPERVISOR'), createRiskAssessment);

router
  .route('/latest')
  .get(protect, getLatestRiskAssessment);

router
  .route('/:id')
  .get(protect, getRiskAssessment)
  .put(protect, authorize('PRACTICE_ADMIN', 'CLINICIAN', 'INTERN', 'SUPERVISOR'), updateRiskAssessment)
  .delete(protect, authorize('PRACTICE_ADMIN', 'CLINICIAN', 'SUPERVISOR'), deleteRiskAssessment);

module.exports = router;
