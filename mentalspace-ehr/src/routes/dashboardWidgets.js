const express = require('express');
const {
  getWidgets,
  getWidget,
  createWidget,
  updateWidget,
  deleteWidget,
  getWidgetsByRole,
  toggleWidgetStatus
} = require('../controllers/dashboardWidgets');

const DashboardWidget = require('../models/DashboardWidget');
const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Apply protection to all routes
router.use(protect);

// Apply admin authorization to all routes
router.use(authorize('admin'));

// Widget routes
router.route('/')
  .get(
    advancedResults(DashboardWidget),
    getWidgets
  )
  .post(createWidget);

router.route('/:id')
  .get(getWidget)
  .put(updateWidget)
  .delete(deleteWidget);

router.route('/role/:role')
  .get(getWidgetsByRole);

router.route('/:id/toggle')
  .put(toggleWidgetStatus);

module.exports = router;
