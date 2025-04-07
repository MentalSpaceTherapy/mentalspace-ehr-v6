const express = require('express');
const {
  getClientFlags,
  getClientFlagsForClient,
  getClientFlag,
  createClientFlag,
  updateClientFlag,
  deleteClientFlag
} = require('../controllers/clientFlags');

const router = express.Router({ mergeParams: true });

const { protect, authorize } = require('../middleware/auth');
const advancedResults = require('../middleware/advancedResults');
const ClientFlag = require('../models/ClientFlag');

router
  .route('/')
  .get(
    protect,
    advancedResults(ClientFlag, {
      path: 'client',
      select: 'firstName lastName'
    }),
    getClientFlags
  )
  .post(protect, createClientFlag);

router
  .route('/:id')
  .get(protect, getClientFlag)
  .put(protect, updateClientFlag)
  .delete(protect, deleteClientFlag);

module.exports = router;
