const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Timesheet = require('../models/Timesheet');
const Staff = require('../models/Staff');
const auditLogger = require('../utils/auditLogger');

// @desc      Get all timesheets
// @route     GET /api/v1/timesheets
// @access    Private
exports.getTimesheets = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc      Get timesheets for a specific staff member
// @route     GET /api/v1/staff/:staffId/timesheets
// @access    Private
exports.getStaffTimesheets = asyncHandler(async (req, res, next) => {
  const timesheets = await Timesheet.find({ staff: req.params.staffId })
    .sort({ date: -1 });

  // Log the access
  await auditLogger.log({
    user: req.user.id,
    action: 'READ',
    resourceType: 'TIMESHEET',
    description: `Accessed timesheets for staff ID: ${req.params.staffId}`,
    req
  });

  res.status(200).json({
    success: true,
    count: timesheets.length,
    data: timesheets
  });
});

// @desc      Get single timesheet
// @route     GET /api/v1/timesheets/:id
// @access    Private
exports.getTimesheet = asyncHandler(async (req, res, next) => {
  const timesheet = await Timesheet.findById(req.params.id)
    .populate({
      path: 'staff',
      select: 'firstName lastName email'
    });

  if (!timesheet) {
    return next(
      new ErrorResponse(`Timesheet not found with id of ${req.params.id}`, 404)
    );
  }

  // Check if user is authorized to view this timesheet
  if (
    timesheet.staff._id.toString() !== req.user.id &&
    req.user.role !== 'PRACTICE_ADMIN' &&
    req.user.role !== 'SUPERVISOR'
  ) {
    return next(
      new ErrorResponse(`Not authorized to access this timesheet`, 403)
    );
  }

  // Log the access
  await auditLogger.log({
    user: req.user.id,
    action: 'READ',
    resourceType: 'TIMESHEET',
    resourceId: timesheet._id,
    description: `Accessed timesheet for ${timesheet.staff.firstName} ${timesheet.staff.lastName}`,
    req
  });

  res.status(200).json({
    success: true,
    data: timesheet
  });
});

// @desc      Create timesheet
// @route     POST /api/v1/timesheets
// @access    Private
exports.createTimesheet = asyncHandler(async (req, res, next) => {
  // Set staff to logged in user if not specified
  if (!req.body.staff) {
    req.body.staff = req.user.id;
  }

  // Check if user is authorized to create timesheet for another staff
  if (
    req.body.staff.toString() !== req.user.id &&
    req.user.role !== 'PRACTICE_ADMIN'
  ) {
    return next(
      new ErrorResponse(`Not authorized to create timesheet for another staff member`, 403)
    );
  }

  const timesheet = await Timesheet.create(req.body);

  // Log the action
  await auditLogger.log({
    user: req.user.id,
    action: 'CREATE',
    resourceType: 'TIMESHEET',
    resourceId: timesheet._id,
    description: `Created timesheet for date: ${new Date(timesheet.date).toISOString().split('T')[0]}`,
    req
  });

  res.status(201).json({
    success: true,
    data: timesheet
  });
});

// @desc      Update timesheet
// @route     PUT /api/v1/timesheets/:id
// @access    Private
exports.updateTimesheet = asyncHandler(async (req, res, next) => {
  let timesheet = await Timesheet.findById(req.params.id);

  if (!timesheet) {
    return next(
      new ErrorResponse(`Timesheet not found with id of ${req.params.id}`, 404)
    );
  }

  // Check if user is authorized to update this timesheet
  if (
    timesheet.staff.toString() !== req.user.id &&
    req.user.role !== 'PRACTICE_ADMIN' &&
    req.user.role !== 'SUPERVISOR'
  ) {
    return next(
      new ErrorResponse(`Not authorized to update this timesheet`, 403)
    );
  }

  // Prevent updating approved timesheets
  if (timesheet.status === 'Approved' || timesheet.status === 'Paid') {
    return next(
      new ErrorResponse(`Cannot update an approved or paid timesheet`, 400)
    );
  }

  timesheet = await Timesheet.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  // Log the action
  await auditLogger.log({
    user: req.user.id,
    action: 'UPDATE',
    resourceType: 'TIMESHEET',
    resourceId: timesheet._id,
    description: `Updated timesheet for date: ${new Date(timesheet.date).toISOString().split('T')[0]}`,
    req
  });

  res.status(200).json({
    success: true,
    data: timesheet
  });
});

// @desc      Delete timesheet
// @route     DELETE /api/v1/timesheets/:id
// @access    Private
exports.deleteTimesheet = asyncHandler(async (req, res, next) => {
  const timesheet = await Timesheet.findById(req.params.id);

  if (!timesheet) {
    return next(
      new ErrorResponse(`Timesheet not found with id of ${req.params.id}`, 404)
    );
  }

  // Check if user is authorized to delete this timesheet
  if (
    timesheet.staff.toString() !== req.user.id &&
    req.user.role !== 'PRACTICE_ADMIN'
  ) {
    return next(
      new ErrorResponse(`Not authorized to delete this timesheet`, 403)
    );
  }

  // Prevent deleting approved timesheets
  if (timesheet.status === 'Approved' || timesheet.status === 'Paid') {
    return next(
      new ErrorResponse(`Cannot delete an approved or paid timesheet`, 400)
    );
  }

  await timesheet.remove();

  // Log the action
  await auditLogger.log({
    user: req.user.id,
    action: 'DELETE',
    resourceType: 'TIMESHEET',
    resourceId: timesheet._id,
    description: `Deleted timesheet for date: ${new Date(timesheet.date).toISOString().split('T')[0]}`,
    req
  });

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc      Approve timesheet
// @route     PUT /api/v1/timesheets/:id/approve
// @access    Private/Admin/Supervisor
exports.approveTimesheet = asyncHandler(async (req, res, next) => {
  let timesheet = await Timesheet.findById(req.params.id);

  if (!timesheet) {
    return next(
      new ErrorResponse(`Timesheet not found with id of ${req.params.id}`, 404)
    );
  }

  // Check if user is authorized to approve timesheets
  if (req.user.role !== 'PRACTICE_ADMIN' && req.user.role !== 'SUPERVISOR') {
    return next(
      new ErrorResponse(`Not authorized to approve timesheets`, 403)
    );
  }

  // Update timesheet status
  timesheet = await Timesheet.findByIdAndUpdate(
    req.params.id,
    {
      status: 'Approved',
      approvedBy: req.user.id,
      approvedAt: Date.now()
    },
    {
      new: true,
      runValidators: true
    }
  );

  // Log the action
  await auditLogger.log({
    user: req.user.id,
    action: 'UPDATE',
    resourceType: 'TIMESHEET',
    resourceId: timesheet._id,
    description: `Approved timesheet for date: ${new Date(timesheet.date).toISOString().split('T')[0]}`,
    req
  });

  res.status(200).json({
    success: true,
    data: timesheet
  });
});

// @desc      Reject timesheet
// @route     PUT /api/v1/timesheets/:id/reject
// @access    Private/Admin/Supervisor
exports.rejectTimesheet = asyncHandler(async (req, res, next) => {
  let timesheet = await Timesheet.findById(req.params.id);

  if (!timesheet) {
    return next(
      new ErrorResponse(`Timesheet not found with id of ${req.params.id}`, 404)
    );
  }

  // Check if user is authorized to reject timesheets
  if (req.user.role !== 'PRACTICE_ADMIN' && req.user.role !== 'SUPERVISOR') {
    return next(
      new ErrorResponse(`Not authorized to reject timesheets`, 403)
    );
  }

  // Ensure rejection reason is provided
  if (!req.body.rejectionReason) {
    return next(
      new ErrorResponse(`Please provide a reason for rejection`, 400)
    );
  }

  // Update timesheet status
  timesheet = await Timesheet.findByIdAndUpdate(
    req.params.id,
    {
      status: 'Rejected',
      rejectionReason: req.body.rejectionReason
    },
    {
      new: true,
      runValidators: true
    }
  );

  // Log the action
  await auditLogger.log({
    user: req.user.id,
    action: 'UPDATE',
    resourceType: 'TIMESHEET',
    resourceId: timesheet._id,
    description: `Rejected timesheet for date: ${new Date(timesheet.date).toISOString().split('T')[0]}`,
    req
  });

  res.status(200).json({
    success: true,
    data: timesheet
  });
});
