const express = require('express');
const {
  getDocumentationSettings,
  createDocumentationSettings,
  updateDocumentationSettings,
  getNoteTypeSettings,
  addCustomField,
  removeCustomField
} = require('../controllers/documentationSettings');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router
  .route('/')
  .get(protect, getDocumentationSettings)
  .post(protect, authorize('PRACTICE_ADMIN'), createDocumentationSettings);

router
  .route('/:id')
  .put(protect, authorize('PRACTICE_ADMIN'), updateDocumentationSettings);

router
  .route('/note-types/:type')
  .get(protect, getNoteTypeSettings);

router
  .route('/:id/custom-fields')
  .post(protect, authorize('PRACTICE_ADMIN'), addCustomField);

router
  .route('/:id/custom-fields/:fieldId')
  .delete(protect, authorize('PRACTICE_ADMIN'), removeCustomField);

module.exports = router;
