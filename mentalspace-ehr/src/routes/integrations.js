const express = require('express');
const {
  getIntegrations,
  getIntegration,
  createIntegration,
  updateIntegration,
  deleteIntegration,
  activateIntegration,
  deactivateIntegration,
  testIntegration,
  syncIntegration,
  getIntegrationsByType
} = require('../controllers/integrations');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');
const advancedResults = require('../middleware/advancedResults');
const Integration = require('../models/Integration');

router
  .route('/')
  .get(
    protect,
    advancedResults(Integration, [
      { path: 'createdBy', select: 'firstName lastName' },
      { path: 'updatedBy', select: 'firstName lastName' }
    ]),
    getIntegrations
  )
  .post(
    protect,
    authorize('PRACTICE_ADMIN', 'SYSTEM_ADMIN'),
    createIntegration
  );

router
  .route('/type/:type')
  .get(
    protect,
    getIntegrationsByType
  );

router
  .route('/:id')
  .get(
    protect,
    getIntegration
  )
  .put(
    protect,
    authorize('PRACTICE_ADMIN', 'SYSTEM_ADMIN'),
    updateIntegration
  )
  .delete(
    protect,
    authorize('PRACTICE_ADMIN', 'SYSTEM_ADMIN'),
    deleteIntegration
  );

router
  .route('/:id/activate')
  .put(
    protect,
    authorize('PRACTICE_ADMIN', 'SYSTEM_ADMIN'),
    activateIntegration
  );

router
  .route('/:id/deactivate')
  .put(
    protect,
    authorize('PRACTICE_ADMIN', 'SYSTEM_ADMIN'),
    deactivateIntegration
  );

router
  .route('/:id/test')
  .post(
    protect,
    authorize('PRACTICE_ADMIN', 'SYSTEM_ADMIN'),
    testIntegration
  );

router
  .route('/:id/sync')
  .post(
    protect,
    authorize('PRACTICE_ADMIN', 'SYSTEM_ADMIN'),
    syncIntegration
  );

module.exports = router;
