const express = require('express');
const {
  getClientNotes,
  getClientNotesForClient,
  getClientNote,
  createClientNote,
  updateClientNote,
  deleteClientNote
} = require('../controllers/clientNotes');

const router = express.Router({ mergeParams: true });

const { protect, authorize } = require('../middleware/auth');
const advancedResults = require('../middleware/advancedResults');
const ClientNote = require('../models/ClientNote');

router
  .route('/')
  .get(
    protect,
    advancedResults(ClientNote, {
      path: 'client',
      select: 'firstName lastName'
    }),
    getClientNotes
  )
  .post(protect, createClientNote);

router
  .route('/:id')
  .get(protect, getClientNote)
  .put(protect, updateClientNote)
  .delete(protect, deleteClientNote);

module.exports = router;
