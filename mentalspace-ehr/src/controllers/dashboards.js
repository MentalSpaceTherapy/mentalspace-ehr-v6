const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const DashboardPreference = require('../models/DashboardPreference');
const DashboardWidget = require('../models/DashboardWidget');
const DashboardMetric = require('../models/DashboardMetric');
const DashboardAlert = require('../models/DashboardAlert');
const { auditLog } = require('../utils/auditLogger');

// @desc    Get dashboard for current user
// @route   GET /api/v1/dashboards
// @access  Private
exports.getDashboard = asyncHandler(async (req, res, next) => {
  // Get user's role from authenticated user
  const userRole = req.user.role;
  
  // Get user's dashboard preferences or create default if not exists
  let preferences = await DashboardPreference.findOne({ staff: req.user.id });
  
  if (!preferences) {
    // Create default preferences based on user role
    preferences = await DashboardPreference.create({
      staff: req.user.id,
      layout: 'default',
      widgets: await getDefaultWidgetsForRole(userRole),
      defaultFilters: {
        dateRange: 'week'
      }
    });
    
    await auditLog(req.user.id, 'DashboardPreference', preferences._id, 'create', 'Created default dashboard preferences');
  }
  
  // Get available widgets for user's role
  const availableWidgets = await DashboardWidget.find({
    allowedRoles: userRole,
    isActive: true
  });
  
  // Get active alerts for user
  const alerts = await DashboardAlert.find({
    $or: [
      { targetRoles: userRole },
      { targetStaff: req.user.id }
    ],
    isActive: true,
    $or: [
      { expiresAt: { $gt: new Date() } },
      { expiresAt: null }
    ]
  }).sort({ priority: -1, createdAt: -1 });
  
  res.status(200).json({
    success: true,
    data: {
      preferences,
      availableWidgets,
      alerts
    }
  });
});

// @desc    Update dashboard preferences
// @route   PUT /api/v1/dashboards/preferences
// @access  Private
exports.updatePreferences = asyncHandler(async (req, res, next) => {
  let preferences = await DashboardPreference.findOne({ staff: req.user.id });
  
  if (!preferences) {
    return next(new ErrorResponse('Dashboard preferences not found', 404));
  }
  
  // Validate that widgets exist and are allowed for user's role
  if (req.body.widgets) {
    const userRole = req.user.role;
    const widgetIds = req.body.widgets.map(w => w.widgetId);
    
    const allowedWidgets = await DashboardWidget.find({
      widgetId: { $in: widgetIds },
      allowedRoles: userRole,
      isActive: true
    });
    
    const allowedWidgetIds = allowedWidgets.map(w => w.widgetId);
    
    // Filter out widgets that aren't allowed
    req.body.widgets = req.body.widgets.filter(w => 
      allowedWidgetIds.includes(w.widgetId)
    );
  }
  
  // Update preferences
  preferences = await DashboardPreference.findOneAndUpdate(
    { staff: req.user.id },
    req.body,
    {
      new: true,
      runValidators: true
    }
  );
  
  await auditLog(req.user.id, 'DashboardPreference', preferences._id, 'update', 'Updated dashboard preferences');
  
  res.status(200).json({
    success: true,
    data: preferences
  });
});

// @desc    Get widget data
// @route   GET /api/v1/dashboards/widgets/:widgetId
// @access  Private
exports.getWidgetData = asyncHandler(async (req, res, next) => {
  const { widgetId } = req.params;
  const userRole = req.user.role;
  
  // Check if widget exists and is allowed for user's role
  const widget = await DashboardWidget.findOne({
    widgetId,
    allowedRoles: userRole,
    isActive: true
  });
  
  if (!widget) {
    return next(new ErrorResponse(`Widget not found or not allowed for your role`, 404));
  }
  
  // Get user's dashboard preferences for filters
  const preferences = await DashboardPreference.findOne({ staff: req.user.id });
  
  // Parse filters from request or use defaults from preferences
  const filters = {
    dateRange: req.query.dateRange || (preferences ? preferences.defaultFilters.dateRange : 'week'),
    customDateStart: req.query.customDateStart || (preferences ? preferences.defaultFilters.customDateStart : null),
    customDateEnd: req.query.customDateEnd || (preferences ? preferences.defaultFilters.customDateEnd : null),
    staffFilter: req.query.staffFilter || (preferences ? preferences.defaultFilters.staffFilter : []),
    locationFilter: req.query.locationFilter || (preferences ? preferences.defaultFilters.locationFilter : [])
  };
  
  // Get widget data based on widget type and data source
  let data;
  
  switch (widget.dataSource) {
    case 'appointments':
      data = await getAppointmentWidgetData(widget, filters, req.user);
      break;
    case 'documentation':
      data = await getDocumentationWidgetData(widget, filters, req.user);
      break;
    case 'billing':
      data = await getBillingWidgetData(widget, filters, req.user);
      break;
    case 'clients':
      data = await getClientWidgetData(widget, filters, req.user);
      break;
    case 'staff':
      data = await getStaffWidgetData(widget, filters, req.user);
      break;
    case 'system':
      data = await getSystemWidgetData(widget, filters, req.user);
      break;
    case 'crm':
      data = await getCrmWidgetData(widget, filters, req.user);
      break;
    case 'metrics':
      data = await getMetricsWidgetData(widget, filters, req.user);
      break;
    default:
      return next(new ErrorResponse(`Unknown data source: ${widget.dataSource}`, 400));
  }
  
  res.status(200).json({
    success: true,
    data: {
      widget,
      data
    }
  });
});

// @desc    Get all dashboard metrics
// @route   GET /api/v1/dashboards/metrics
// @access  Private (Admin only)
exports.getMetrics = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc    Get single dashboard metric
// @route   GET /api/v1/dashboards/metrics/:id
// @access  Private (Admin only)
exports.getMetric = asyncHandler(async (req, res, next) => {
  const metric = await DashboardMetric.findById(req.params.id);
  
  if (!metric) {
    return next(new ErrorResponse(`Metric not found with id of ${req.params.id}`, 404));
  }
  
  res.status(200).json({
    success: true,
    data: metric
  });
});

// @desc    Create dashboard metric
// @route   POST /api/v1/dashboards/metrics
// @access  Private (Admin only)
exports.createMetric = asyncHandler(async (req, res, next) => {
  const metric = await DashboardMetric.create(req.body);
  
  await auditLog(req.user.id, 'DashboardMetric', metric._id, 'create', 'Created dashboard metric');
  
  res.status(201).json({
    success: true,
    data: metric
  });
});

// @desc    Update dashboard metric
// @route   PUT /api/v1/dashboards/metrics/:id
// @access  Private (Admin only)
exports.updateMetric = asyncHandler(async (req, res, next) => {
  let metric = await DashboardMetric.findById(req.params.id);
  
  if (!metric) {
    return next(new ErrorResponse(`Metric not found with id of ${req.params.id}`, 404));
  }
  
  metric = await DashboardMetric.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  
  await auditLog(req.user.id, 'DashboardMetric', metric._id, 'update', 'Updated dashboard metric');
  
  res.status(200).json({
    success: true,
    data: metric
  });
});

// @desc    Delete dashboard metric
// @route   DELETE /api/v1/dashboards/metrics/:id
// @access  Private (Admin only)
exports.deleteMetric = asyncHandler(async (req, res, next) => {
  const metric = await DashboardMetric.findById(req.params.id);
  
  if (!metric) {
    return next(new ErrorResponse(`Metric not found with id of ${req.params.id}`, 404));
  }
  
  await metric.remove();
  
  await auditLog(req.user.id, 'DashboardMetric', req.params.id, 'delete', 'Deleted dashboard metric');
  
  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Get all dashboard alerts
// @route   GET /api/v1/dashboards/alerts
// @access  Private
exports.getAlerts = asyncHandler(async (req, res, next) => {
  const userRole = req.user.role;
  
  // Get alerts for user's role or specifically targeted to user
  const alerts = await DashboardAlert.find({
    $or: [
      { targetRoles: userRole },
      { targetStaff: req.user.id }
    ],
    isActive: true,
    $or: [
      { expiresAt: { $gt: new Date() } },
      { expiresAt: null }
    ]
  }).sort({ priority: -1, createdAt: -1 });
  
  res.status(200).json({
    success: true,
    count: alerts.length,
    data: alerts
  });
});

// @desc    Mark alert as read
// @route   PUT /api/v1/dashboards/alerts/:id/read
// @access  Private
exports.markAlertRead = asyncHandler(async (req, res, next) => {
  const alert = await DashboardAlert.findById(req.params.id);
  
  if (!alert) {
    return next(new ErrorResponse(`Alert not found with id of ${req.params.id}`, 404));
  }
  
  // Check if user is allowed to see this alert
  const userRole = req.user.role;
  const isTargeted = alert.targetRoles.includes(userRole) || 
                    alert.targetStaff.some(id => id.toString() === req.user.id);
  
  if (!isTargeted) {
    return next(new ErrorResponse(`Not authorized to access this alert`, 403));
  }
  
  // Check if already read by this user
  const alreadyRead = alert.readBy.some(read => read.staff.toString() === req.user.id);
  
  if (!alreadyRead) {
    alert.readBy.push({
      staff: req.user.id,
      readAt: new Date()
    });
    
    // If all targeted staff have read it, mark as read
    if (alert.targetStaff.length > 0 && 
        alert.targetStaff.every(staffId => 
          alert.readBy.some(read => read.staff.toString() === staffId.toString())
        )) {
      alert.isRead = true;
    }
    
    await alert.save();
  }
  
  res.status(200).json({
    success: true,
    data: alert
  });
});

// @desc    Create dashboard alert
// @route   POST /api/v1/dashboards/alerts
// @access  Private (Admin only)
exports.createAlert = asyncHandler(async (req, res, next) => {
  const alert = await DashboardAlert.create(req.body);
  
  await auditLog(req.user.id, 'DashboardAlert', alert._id, 'create', 'Created dashboard alert');
  
  res.status(201).json({
    success: true,
    data: alert
  });
});

// @desc    Update dashboard alert
// @route   PUT /api/v1/dashboards/alerts/:id
// @access  Private (Admin only)
exports.updateAlert = asyncHandler(async (req, res, next) => {
  let alert = await DashboardAlert.findById(req.params.id);
  
  if (!alert) {
    return next(new ErrorResponse(`Alert not found with id of ${req.params.id}`, 404));
  }
  
  alert = await DashboardAlert.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  
  await auditLog(req.user.id, 'DashboardAlert', alert._id, 'update', 'Updated dashboard alert');
  
  res.status(200).json({
    success: true,
    data: alert
  });
});

// @desc    Delete dashboard alert
// @route   DELETE /api/v1/dashboards/alerts/:id
// @access  Private (Admin only)
exports.deleteAlert = asyncHandler(async (req, res, next) => {
  const alert = await DashboardAlert.findById(req.params.id);
  
  if (!alert) {
    return next(new ErrorResponse(`Alert not found with id of ${req.params.id}`, 404));
  }
  
  await alert.remove();
  
  await auditLog(req.user.id, 'DashboardAlert', req.params.id, 'delete', 'Deleted dashboard alert');
  
  res.status(200).json({
    success: true,
    data: {}
  });
});

// Helper functions for widget data retrieval
async function getDefaultWidgetsForRole(role) {
  const widgets = await DashboardWidget.find({
    allowedRoles: role,
    isActive: true
  });
  
  // Create default widget layout based on role
  let defaultWidgets = [];
  let position = 0;
  
  widgets.forEach(widget => {
    const row = Math.floor(position / 2);
    const col = position % 2;
    
    defaultWidgets.push({
      widgetId: widget.widgetId,
      position: {
        x: col,
        y: row,
        width: widget.defaultSize.width,
        height: widget.defaultSize.height
      },
      visible: true,
      settings: widget.defaultSettings
    });
    
    position++;
  });
  
  return defaultWidgets;
}

// These functions would be implemented to retrieve data from various modules
async function getAppointmentWidgetData(widget, filters, user) {
  // Implementation would query the Appointment model based on widget type and filters
  // This is a placeholder that would be replaced with actual implementation
  return { message: 'Appointment data would be retrieved here' };
}

async function getDocumentationWidgetData(widget, filters, user) {
  // Implementation would query the Note model based on widget type and filters
  return { message: 'Documentation data would be retrieved here' };
}

async function getBillingWidgetData(widget, filters, user) {
  // Implementation would query the Claim, Payment, Invoice models based on widget type and filters
  return { message: 'Billing data would be retrieved here' };
}

async function getClientWidgetData(widget, filters, user) {
  // Implementation would query the Client model based on widget type and filters
  return { message: 'Client data would be retrieved here' };
}

async function getStaffWidgetData(widget, filters, user) {
  // Implementation would query the Staff model based on widget type and filters
  return { message: 'Staff data would be retrieved here' };
}

async function getSystemWidgetData(widget, filters, user) {
  // Implementation would retrieve system metrics
  return { message: 'System data would be retrieved here' };
}

async function getCrmWidgetData(widget, filters, user) {
  // Implementation would query the Lead, Contact, Campaign models based on widget type and filters
  return { message: 'CRM data would be retrieved here' };
}

async function getMetricsWidgetData(widget, filters, user) {
  // Implementation would query the DashboardMetric model based on widget type and filters
  return { message: 'Metrics data would be retrieved here' };
}
