const express = require('express');
const {
  getDashboard,
  updatePreferences,
  getWidgetData,
  getMetrics,
  getMetric,
  createMetric,
  updateMetric,
  deleteMetric,
  getAlerts,
  markAlertRead,
  createAlert,
  updateAlert,
  deleteAlert
} = require('../controllers/dashboards');

const DashboardMetric = require('../models/DashboardMetric');
const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Apply protection to all routes
router.use(protect);

// Main dashboard route
router.route('/')
  .get(getDashboard);

// Widget data route
router.route('/widgets/:widgetId')
  .get(getWidgetData);

// Metrics routes
router.route('/metrics')
  .get(
    authorize('admin'),
    advancedResults(DashboardMetric),
    getMetrics
  )
  .post(
    authorize('admin'),
    createMetric
  );

router.route('/metrics/:id')
  .get(
    authorize('admin'),
    getMetric
  )
  .put(
    authorize('admin'),
    updateMetric
  )
  .delete(
    authorize('admin'),
    deleteMetric
  );

// Alerts routes
router.route('/alerts')
  .get(getAlerts)
  .post(
    authorize('admin'),
    createAlert
  );

router.route('/alerts/:id')
  .put(
    authorize('admin'),
    updateAlert
  )
  .delete(
    authorize('admin'),
    deleteAlert
  );

router.route('/alerts/:id/read')
  .put(markAlertRead);

// Preferences route
router.route('/preferences')
  .put(updatePreferences);

module.exports = router;
