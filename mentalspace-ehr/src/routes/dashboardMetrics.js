const express = require('express');
const {
  calculateMetrics,
  getMetricHistory,
  getMetricsByCategory,
  getMetricsByRole,
  toggleMetricStatus
} = require('../controllers/dashboardMetrics');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Apply protection to all routes
router.use(protect);

// Apply admin authorization to all routes
router.use(authorize('admin'));

// Metrics calculation route
router.route('/calculate')
  .post(calculateMetrics);

// Metric history route
router.route('/:id/history')
  .get(getMetricHistory);

// Get metrics by category
router.route('/category/:category')
  .get(getMetricsByCategory);

// Get metrics by role
router.route('/role/:role')
  .get(getMetricsByRole);

// Toggle metric status
router.route('/:id/toggle')
  .put(toggleMetricStatus);

module.exports = router;
