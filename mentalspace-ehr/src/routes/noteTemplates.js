const express = require('express');
const {
  getNoteTemplates,
  getNoteTemplatesByType,
  getNoteTemplate,
  createNoteTemplate,
  updateNoteTemplate,
  deleteNoteTemplate
} = require('../controllers/noteTemplates');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');
const advancedResults = require('../middleware/advancedResults');
const NoteTemplate = require('../models/NoteTemplate');

router
  .route('/')
  .get(
    protect,
    advancedResults(NoteTemplate),
    getNoteTemplates
  )
  .post(protect, authorize('PRACTICE_ADMIN', 'SUPERVISOR'), createNoteTemplate);

router
  .route('/type/:noteType')
  .get(protect, getNoteTemplatesByType);

router
  .route('/:id')
  .get(protect, getNoteTemplate)
  .put(protect, authorize('PRACTICE_ADMIN', 'SUPERVISOR'), updateNoteTemplate)
  .delete(protect, authorize('PRACTICE_ADMIN', 'SUPERVISOR'), deleteNoteTemplate);

module.exports = router;
