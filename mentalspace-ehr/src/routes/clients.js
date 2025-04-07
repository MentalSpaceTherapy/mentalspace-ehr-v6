const express = require('express');
const {
  getClients,
  getClient,
  createClient,
  updateClient,
  deleteClient
} = require('../controllers/clients');

const router = express.Router();

const { protect, authorize, logAccess } = require('../middleware/auth');

router
  .route('/')
  .get(protect, getClients)
  .post(protect, authorize('PRACTICE_ADMIN', 'CLINICIAN', 'RECEPTIONIST'), createClient);

router
  .route('/:id')
  .get(protect, logAccess('CLIENT'), getClient)
  .put(protect, authorize('PRACTICE_ADMIN', 'CLINICIAN', 'RECEPTIONIST'), updateClient)
  .delete(protect, authorize('PRACTICE_ADMIN'), deleteClient);

module.exports = router;
