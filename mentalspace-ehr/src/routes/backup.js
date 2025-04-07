const express = require('express');
const {
  createDatabaseBackup,
  getDatabaseBackups,
  downloadDatabaseBackup,
  deleteDatabaseBackup,
  restoreDatabaseBackup,
  createLogsBackup,
  getSystemHealth
} = require('../controllers/backup');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

// All backup routes require admin privileges
router.use(protect);
router.use(authorize('PRACTICE_ADMIN', 'SYSTEM_ADMIN'));

router
  .route('/database')
  .get(getDatabaseBackups)
  .post(createDatabaseBackup);

router
  .route('/database/:fileName')
  .get(downloadDatabaseBackup)
  .delete(deleteDatabaseBackup);

router
  .route('/database/:fileName/restore')
  .post(restoreDatabaseBackup);

router
  .route('/logs')
  .post(createLogsBackup);

router
  .route('/health')
  .get(getSystemHealth);

module.exports = router;
