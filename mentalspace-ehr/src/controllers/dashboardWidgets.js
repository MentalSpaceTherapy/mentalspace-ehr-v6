const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const DashboardWidget = require('../models/DashboardWidget');
const { auditLog } = require('../utils/auditLogger');

// @desc    Get all dashboard widgets
// @route   GET /api/v1/dashboards/widgets
// @access  Private (Admin only)
exports.getWidgets = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc    Get single dashboard widget
// @route   GET /api/v1/dashboards/widgets/:id
// @access  Private (Admin only)
exports.getWidget = asyncHandler(async (req, res, next) => {
  const widget = await DashboardWidget.findById(req.params.id);
  
  if (!widget) {
    return next(new ErrorResponse(`Widget not found with id of ${req.params.id}`, 404));
  }
  
  res.status(200).json({
    success: true,
    data: widget
  });
});

// @desc    Create dashboard widget
// @route   POST /api/v1/dashboards/widgets
// @access  Private (Admin only)
exports.createWidget = asyncHandler(async (req, res, next) => {
  const widget = await DashboardWidget.create(req.body);
  
  await auditLog(req.user.id, 'DashboardWidget', widget._id, 'create', 'Created dashboard widget');
  
  res.status(201).json({
    success: true,
    data: widget
  });
});

// @desc    Update dashboard widget
// @route   PUT /api/v1/dashboards/widgets/:id
// @access  Private (Admin only)
exports.updateWidget = asyncHandler(async (req, res, next) => {
  let widget = await DashboardWidget.findById(req.params.id);
  
  if (!widget) {
    return next(new ErrorResponse(`Widget not found with id of ${req.params.id}`, 404));
  }
  
  widget = await DashboardWidget.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  
  await auditLog(req.user.id, 'DashboardWidget', widget._id, 'update', 'Updated dashboard widget');
  
  res.status(200).json({
    success: true,
    data: widget
  });
});

// @desc    Delete dashboard widget
// @route   DELETE /api/v1/dashboards/widgets/:id
// @access  Private (Admin only)
exports.deleteWidget = asyncHandler(async (req, res, next) => {
  const widget = await DashboardWidget.findById(req.params.id);
  
  if (!widget) {
    return next(new ErrorResponse(`Widget not found with id of ${req.params.id}`, 404));
  }
  
  await widget.remove();
  
  await auditLog(req.user.id, 'DashboardWidget', req.params.id, 'delete', 'Deleted dashboard widget');
  
  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Get available widgets for role
// @route   GET /api/v1/dashboards/widgets/role/:role
// @access  Private (Admin only)
exports.getWidgetsByRole = asyncHandler(async (req, res, next) => {
  const { role } = req.params;
  
  const widgets = await DashboardWidget.find({
    allowedRoles: role,
    isActive: true
  });
  
  res.status(200).json({
    success: true,
    count: widgets.length,
    data: widgets
  });
});

// @desc    Toggle widget active status
// @route   PUT /api/v1/dashboards/widgets/:id/toggle
// @access  Private (Admin only)
exports.toggleWidgetStatus = asyncHandler(async (req, res, next) => {
  let widget = await DashboardWidget.findById(req.params.id);
  
  if (!widget) {
    return next(new ErrorResponse(`Widget not found with id of ${req.params.id}`, 404));
  }
  
  widget.isActive = !widget.isActive;
  await widget.save();
  
  await auditLog(req.user.id, 'DashboardWidget', widget._id, 'update', `${widget.isActive ? 'Activated' : 'Deactivated'} dashboard widget`);
  
  res.status(200).json({
    success: true,
    data: widget
  });
});
