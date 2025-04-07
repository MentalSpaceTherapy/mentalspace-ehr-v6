const express = require('express');
const {
  getDiagnoses,
  getDiagnosesByType,
  getCommonDiagnoses,
  getDiagnosis,
  createDiagnosis,
  updateDiagnosis,
  deleteDiagnosis,
  searchDiagnoses
} = require('../controllers/diagnoses');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');
const advancedResults = require('../middleware/advancedResults');
const Diagnosis = require('../models/Diagnosis');

router
  .route('/')
  .get(
    protect,
    advancedResults(Diagnosis),
    getDiagnoses
  )
  .post(protect, authorize('PRACTICE_ADMIN', 'SYSTEM_ADMIN'), createDiagnosis);

router
  .route('/type/:codeType')
  .get(protect, getDiagnosesByType);

router
  .route('/common')
  .get(protect, getCommonDiagnoses);

router
  .route('/search/:term')
  .get(protect, searchDiagnoses);

router
  .route('/:id')
  .get(protect, getDiagnosis)
  .put(protect, authorize('PRACTICE_ADMIN', 'SYSTEM_ADMIN'), updateDiagnosis)
  .delete(protect, authorize('PRACTICE_ADMIN', 'SYSTEM_ADMIN'), deleteDiagnosis);

module.exports = router;
