const express = require('express');
const {
  getSettings,
  getSetting,
  getSettingByKey,
  getSettingsByCategory,
  createSetting,
  updateSetting,
  deleteSetting,
  getSettingAuditLogs,
  bulkUpdateSettings
} = require('../controllers/settings');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');
const advancedResults = require('../middleware/advancedResults');
const Setting = require('../models/Setting');

router
  .route('/')
  .get(
    protect,
    advancedResults(Setting, [
      { path: 'createdBy', select: 'firstName lastName' },
      { path: 'updatedBy', select: 'firstName lastName' }
    ]),
    getSettings
  )
  .post(
    protect,
    authorize('PRACTICE_ADMIN', 'SYSTEM_ADMIN'),
    createSetting
  );

router
  .route('/bulk')
  .put(
    protect,
    authorize('PRACTICE_ADMIN', 'SYSTEM_ADMIN'),
    bulkUpdateSettings
  );

router
  .route('/category/:category')
  .get(
    protect,
    getSettingsByCategory
  );

router
  .route('/key/:key')
  .get(
    protect,
    getSettingByKey
  );

router
  .route('/:id')
  .get(
    protect,
    getSetting
  )
  .put(
    protect,
    authorize('PRACTICE_ADMIN', 'SYSTEM_ADMIN'),
    updateSetting
  )
  .delete(
    protect,
    authorize('PRACTICE_ADMIN', 'SYSTEM_ADMIN'),
    deleteSetting
  );

router
  .route('/:id/audit-logs')
  .get(
    protect,
    authorize('PRACTICE_ADMIN', 'SYSTEM_ADMIN'),
    getSettingAuditLogs
  );

module.exports = router;
