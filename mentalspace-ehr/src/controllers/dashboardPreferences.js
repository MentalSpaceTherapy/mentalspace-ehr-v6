const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const DashboardPreference = require('../models/DashboardPreference');
const { auditLog } = require('../utils/auditLogger');

// @desc    Get dashboard preferences for current user
// @route   GET /api/v1/dashboards/preferences
// @access  Private
exports.getPreferences = asyncHandler(async (req, res, next) => {
  const preferences = await DashboardPreference.findOne({ staff: req.user.id });
  
  if (!preferences) {
    return next(new ErrorResponse('Dashboard preferences not found', 404));
  }
  
  res.status(200).json({
    success: true,
    data: preferences
  });
});

// @desc    Create dashboard preferences for current user
// @route   POST /api/v1/dashboards/preferences
// @access  Private
exports.createPreferences = asyncHandler(async (req, res, next) => {
  // Check if preferences already exist
  const existingPreferences = await DashboardPreference.findOne({ staff: req.user.id });
  
  if (existingPreferences) {
    return next(new ErrorResponse('Dashboard preferences already exist for this user', 400));
  }
  
  // Set staff ID from authenticated user
  req.body.staff = req.user.id;
  
  const preferences = await DashboardPreference.create(req.body);
  
  await auditLog(req.user.id, 'DashboardPreference', preferences._id, 'create', 'Created dashboard preferences');
  
  res.status(201).json({
    success: true,
    data: preferences
  });
});

// @desc    Reset dashboard preferences to default for current user
// @route   PUT /api/v1/dashboards/preferences/reset
// @access  Private
exports.resetPreferences = asyncHandler(async (req, res, next) => {
  // Delete existing preferences
  await DashboardPreference.findOneAndDelete({ staff: req.user.id });
  
  // Get user's role
  const userRole = req.user.role;
  
  // Create default preferences based on user role
  // This would typically call a helper function to get default widgets for the role
  const defaultWidgets = []; // This would be populated by a helper function
  
  const preferences = await DashboardPreference.create({
    staff: req.user.id,
    layout: 'default',
    widgets: defaultWidgets,
    defaultFilters: {
      dateRange: 'week'
    }
  });
  
  await auditLog(req.user.id, 'DashboardPreference', preferences._id, 'reset', 'Reset dashboard preferences to default');
  
  res.status(200).json({
    success: true,
    data: preferences
  });
});

// @desc    Get all users' dashboard preferences (admin only)
// @route   GET /api/v1/dashboards/preferences/all
// @access  Private (Admin only)
exports.getAllPreferences = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc    Update widget position in dashboard
// @route   PUT /api/v1/dashboards/preferences/widgets/:widgetId/position
// @access  Private
exports.updateWidgetPosition = asyncHandler(async (req, res, next) => {
  const { widgetId } = req.params;
  const { x, y, width, height } = req.body;
  
  let preferences = await DashboardPreference.findOne({ staff: req.user.id });
  
  if (!preferences) {
    return next(new ErrorResponse('Dashboard preferences not found', 404));
  }
  
  // Find the widget in the user's preferences
  const widgetIndex = preferences.widgets.findIndex(w => w.widgetId === widgetId);
  
  if (widgetIndex === -1) {
    return next(new ErrorResponse(`Widget with ID ${widgetId} not found in user preferences`, 404));
  }
  
  // Update the widget position
  preferences.widgets[widgetIndex].position = {
    x: x !== undefined ? x : preferences.widgets[widgetIndex].position.x,
    y: y !== undefined ? y : preferences.widgets[widgetIndex].position.y,
    width: width !== undefined ? width : preferences.widgets[widgetIndex].position.width,
    height: height !== undefined ? height : preferences.widgets[widgetIndex].position.height
  };
  
  await preferences.save();
  
  await auditLog(req.user.id, 'DashboardPreference', preferences._id, 'update', 'Updated widget position');
  
  res.status(200).json({
    success: true,
    data: preferences
  });
});

// @desc    Toggle widget visibility in dashboard
// @route   PUT /api/v1/dashboards/preferences/widgets/:widgetId/visibility
// @access  Private
exports.toggleWidgetVisibility = asyncHandler(async (req, res, next) => {
  const { widgetId } = req.params;
  
  let preferences = await DashboardPreference.findOne({ staff: req.user.id });
  
  if (!preferences) {
    return next(new ErrorResponse('Dashboard preferences not found', 404));
  }
  
  // Find the widget in the user's preferences
  const widgetIndex = preferences.widgets.findIndex(w => w.widgetId === widgetId);
  
  if (widgetIndex === -1) {
    return next(new ErrorResponse(`Widget with ID ${widgetId} not found in user preferences`, 404));
  }
  
  // Toggle visibility
  preferences.widgets[widgetIndex].visible = !preferences.widgets[widgetIndex].visible;
  
  await preferences.save();
  
  await auditLog(req.user.id, 'DashboardPreference', preferences._id, 'update', `${preferences.widgets[widgetIndex].visible ? 'Showed' : 'Hid'} widget`);
  
  res.status(200).json({
    success: true,
    data: preferences
  });
});

// @desc    Update widget settings in dashboard
// @route   PUT /api/v1/dashboards/preferences/widgets/:widgetId/settings
// @access  Private
exports.updateWidgetSettings = asyncHandler(async (req, res, next) => {
  const { widgetId } = req.params;
  const { settings } = req.body;
  
  let preferences = await DashboardPreference.findOne({ staff: req.user.id });
  
  if (!preferences) {
    return next(new ErrorResponse('Dashboard preferences not found', 404));
  }
  
  // Find the widget in the user's preferences
  const widgetIndex = preferences.widgets.findIndex(w => w.widgetId === widgetId);
  
  if (widgetIndex === -1) {
    return next(new ErrorResponse(`Widget with ID ${widgetId} not found in user preferences`, 404));
  }
  
  // Update settings
  preferences.widgets[widgetIndex].settings = settings;
  
  await preferences.save();
  
  await auditLog(req.user.id, 'DashboardPreference', preferences._id, 'update', 'Updated widget settings');
  
  res.status(200).json({
    success: true,
    data: preferences
  });
});
