const express = require('express');
const {
  getNotes,
  getClientNotes,
  getProviderNotes,
  getNote,
  createNote,
  updateNote,
  deleteNote,
  signNote,
  coSignNote,
  getNoteVersions,
  getNoteVersion
} = require('../controllers/notes');

const router = express.Router({ mergeParams: true });

const { protect, authorize } = require('../middleware/auth');
const advancedResults = require('../middleware/advancedResults');
const Note = require('../models/Note');

router
  .route('/')
  .get(
    protect,
    advancedResults(Note, [
      { path: 'client', select: 'firstName lastName' },
      { path: 'provider', select: 'firstName lastName' }
    ]),
    getNotes
  )
  .post(protect, authorize('PRACTICE_ADMIN', 'CLINICIAN', 'INTERN', 'SUPERVISOR'), createNote);

router
  .route('/:id')
  .get(protect, getNote)
  .put(protect, authorize('PRACTICE_ADMIN', 'CLINICIAN', 'INTERN', 'SUPERVISOR'), updateNote)
  .delete(protect, authorize('PRACTICE_ADMIN', 'CLINICIAN', 'SUPERVISOR'), deleteNote);

router
  .route('/:id/sign')
  .put(protect, authorize('PRACTICE_ADMIN', 'CLINICIAN', 'INTERN', 'SUPERVISOR'), signNote);

router
  .route('/:id/cosign')
  .put(protect, authorize('PRACTICE_ADMIN', 'CLINICIAN', 'SUPERVISOR'), coSignNote);

router
  .route('/:id/versions')
  .get(protect, getNoteVersions);

module.exports = router;
