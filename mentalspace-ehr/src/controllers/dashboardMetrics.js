const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const DashboardMetric = require('../models/DashboardMetric');
const { auditLog } = require('../utils/auditLogger');

// @desc    Calculate and update dashboard metrics
// @route   POST /api/v1/dashboards/metrics/calculate
// @access  Private (Admin only)
exports.calculateMetrics = asyncHandler(async (req, res, next) => {
  // Get all active metrics
  const metrics = await DashboardMetric.find({ isActive: true });
  
  const results = {
    success: [],
    failed: []
  };
  
  // Process each metric
  for (const metric of metrics) {
    try {
      // Calculate metric value based on calculation method
      const calculatedValue = await calculateMetricValue(metric);
      
      // Update the metric with the new value
      metric.lastCalculated = new Date();
      
      // Store the calculated value in a way that depends on the metric's structure
      // This is a simplified example - real implementation would be more complex
      if (!metric.values) {
        metric.values = [];
      }
      
      metric.values.unshift({
        date: new Date(),
        value: calculatedValue
      });
      
      // Keep only the last 30 values
      if (metric.values.length > 30) {
        metric.values = metric.values.slice(0, 30);
      }
      
      await metric.save();
      
      results.success.push({
        metricId: metric.metricId,
        name: metric.name,
        value: calculatedValue
      });
    } catch (error) {
      results.failed.push({
        metricId: metric.metricId,
        name: metric.name,
        error: error.message
      });
    }
  }
  
  await auditLog(req.user.id, 'DashboardMetric', null, 'calculate', 'Calculated dashboard metrics');
  
  res.status(200).json({
    success: true,
    data: results
  });
});

// @desc    Get metric history
// @route   GET /api/v1/dashboards/metrics/:id/history
// @access  Private (Admin only)
exports.getMetricHistory = asyncHandler(async (req, res, next) => {
  const metric = await DashboardMetric.findById(req.params.id);
  
  if (!metric) {
    return next(new ErrorResponse(`Metric not found with id of ${req.params.id}`, 404));
  }
  
  res.status(200).json({
    success: true,
    data: metric.values || []
  });
});

// @desc    Get metrics by category
// @route   GET /api/v1/dashboards/metrics/category/:category
// @access  Private (Admin only)
exports.getMetricsByCategory = asyncHandler(async (req, res, next) => {
  const { category } = req.params;
  
  const metrics = await DashboardMetric.find({
    category,
    isActive: true
  });
  
  res.status(200).json({
    success: true,
    count: metrics.length,
    data: metrics
  });
});

// @desc    Get metrics by role
// @route   GET /api/v1/dashboards/metrics/role/:role
// @access  Private (Admin only)
exports.getMetricsByRole = asyncHandler(async (req, res, next) => {
  const { role } = req.params;
  
  const metrics = await DashboardMetric.find({
    visibleToRoles: role,
    isActive: true
  });
  
  res.status(200).json({
    success: true,
    count: metrics.length,
    data: metrics
  });
});

// @desc    Toggle metric active status
// @route   PUT /api/v1/dashboards/metrics/:id/toggle
// @access  Private (Admin only)
exports.toggleMetricStatus = asyncHandler(async (req, res, next) => {
  let metric = await DashboardMetric.findById(req.params.id);
  
  if (!metric) {
    return next(new ErrorResponse(`Metric not found with id of ${req.params.id}`, 404));
  }
  
  metric.isActive = !metric.isActive;
  await metric.save();
  
  await auditLog(req.user.id, 'DashboardMetric', metric._id, 'update', `${metric.isActive ? 'Activated' : 'Deactivated'} dashboard metric`);
  
  res.status(200).json({
    success: true,
    data: metric
  });
});

// Helper function to calculate metric value
// This would be replaced with actual implementation for each metric type
async function calculateMetricValue(metric) {
  // This is a placeholder - real implementation would query relevant models
  // based on the metric's calculation method and data source
  
  switch (metric.calculationMethod) {
    case 'count':
      return await calculateCountMetric(metric);
    case 'sum':
      return await calculateSumMetric(metric);
    case 'average':
      return await calculateAverageMetric(metric);
    case 'percentage':
      return await calculatePercentageMetric(metric);
    case 'custom':
      return await calculateCustomMetric(metric);
    default:
      throw new Error(`Unknown calculation method: ${metric.calculationMethod}`);
  }
}

// These functions would be implemented to calculate different types of metrics
// They are placeholders that would be replaced with actual implementations
async function calculateCountMetric(metric) {
  // Example: count of appointments, clients, etc.
  return Math.floor(Math.random() * 100); // Placeholder
}

async function calculateSumMetric(metric) {
  // Example: sum of payments, session durations, etc.
  return Math.floor(Math.random() * 10000); // Placeholder
}

async function calculateAverageMetric(metric) {
  // Example: average session duration, average payment amount, etc.
  return Math.floor(Math.random() * 100) / 10; // Placeholder
}

async function calculatePercentageMetric(metric) {
  // Example: percentage of no-shows, documentation compliance, etc.
  return Math.floor(Math.random() * 100); // Placeholder
}

async function calculateCustomMetric(metric) {
  // Custom calculation logic based on metric.dataSource
  return Math.floor(Math.random() * 1000) / 10; // Placeholder
}
