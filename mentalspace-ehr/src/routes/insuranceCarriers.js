const express = require('express');
const {
  getInsuranceCarriers,
  getInsuranceCarrier,
  createInsuranceCarrier,
  updateInsuranceCarrier,
  deleteInsuranceCarrier
} = require('../controllers/insuranceCarriers');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');
const advancedResults = require('../middleware/advancedResults');
const InsuranceCarrier = require('../models/InsuranceCarrier');

router
  .route('/')
  .get(
    protect,
    advancedResults(InsuranceCarrier),
    getInsuranceCarriers
  )
  .post(protect, authorize('PRACTICE_ADMIN', 'BILLING'), createInsuranceCarrier);

router
  .route('/:id')
  .get(protect, getInsuranceCarrier)
  .put(protect, authorize('PRACTICE_ADMIN', 'BILLING'), updateInsuranceCarrier)
  .delete(protect, authorize('PRACTICE_ADMIN', 'BILLING'), deleteInsuranceCarrier);

module.exports = router;
