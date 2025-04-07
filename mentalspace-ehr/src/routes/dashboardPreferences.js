const express = require('express');
const {
  getPreferences,
  createPreferences,
  resetPreferences,
  getAllPreferences,
  updateWidgetPosition,
  toggleWidgetVisibility,
  updateWidgetSettings
} = require('../controllers/dashboardPreferences');

const DashboardPreference = require('../models/DashboardPreference');
const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Apply protection to all routes
router.use(protect);

// User preference routes
router.route('/')
  .get(getPreferences)
  .post(createPreferences);

router.route('/reset')
  .put(resetPreferences);

// Admin routes for managing all preferences
router.route('/all')
  .get(
    authorize('admin'),
    advancedResults(DashboardPreference, {
      path: 'staff',
      select: 'name email role'
    }),
    getAllPreferences
  );

// Widget position and visibility routes
router.route('/widgets/:widgetId/position')
  .put(updateWidgetPosition);

router.route('/widgets/:widgetId/visibility')
  .put(toggleWidgetVisibility);

router.route('/widgets/:widgetId/settings')
  .put(updateWidgetSettings);

module.exports = router;
