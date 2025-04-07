const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Payroll = require('../models/Payroll');
const Timesheet = require('../models/Timesheet');
const Staff = require('../models/Staff');
const auditLogger = require('../utils/auditLogger');

// @desc      Get all payrolls
// @route     GET /api/v1/payrolls
// @access    Private/Admin
exports.getPayrolls = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc      Get payrolls for a specific staff member
// @route     GET /api/v1/staff/:staffId/payrolls
// @access    Private
exports.getStaffPayrolls = asyncHandler(async (req, res, next) => {
  // Check if user is authorized to view these payrolls
  if (
    req.params.staffId !== req.user.id &&
    req.user.role !== 'PRACTICE_ADMIN' &&
    req.user.role !== 'BILLING'
  ) {
    return next(
      new ErrorResponse(`Not authorized to access these payroll records`, 403)
    );
  }

  const payrolls = await Payroll.find({ staff: req.params.staffId })
    .sort({ payPeriodEnd: -1 });

  // Log the access
  await auditLogger.log({
    user: req.user.id,
    action: 'READ',
    resourceType: 'PAYROLL',
    description: `Accessed payroll records for staff ID: ${req.params.staffId}`,
    req
  });

  res.status(200).json({
    success: true,
    count: payrolls.length,
    data: payrolls
  });
});

// @desc      Get single payroll
// @route     GET /api/v1/payrolls/:id
// @access    Private
exports.getPayroll = asyncHandler(async (req, res, next) => {
  const payroll = await Payroll.findById(req.params.id)
    .populate({
      path: 'staff',
      select: 'firstName lastName email'
    })
    .populate('timesheets');

  if (!payroll) {
    return next(
      new ErrorResponse(`Payroll not found with id of ${req.params.id}`, 404)
    );
  }

  // Check if user is authorized to view this payroll
  if (
    payroll.staff._id.toString() !== req.user.id &&
    req.user.role !== 'PRACTICE_ADMIN' &&
    req.user.role !== 'BILLING'
  ) {
    return next(
      new ErrorResponse(`Not authorized to access this payroll record`, 403)
    );
  }

  // Log the access
  await auditLogger.log({
    user: req.user.id,
    action: 'READ',
    resourceType: 'PAYROLL',
    resourceId: payroll._id,
    description: `Accessed payroll record for ${payroll.staff.firstName} ${payroll.staff.lastName}`,
    req
  });

  res.status(200).json({
    success: true,
    data: payroll
  });
});

// @desc      Create payroll
// @route     POST /api/v1/payrolls
// @access    Private/Admin
exports.createPayroll = asyncHandler(async (req, res, next) => {
  // Check if user is authorized to create payroll records
  if (req.user.role !== 'PRACTICE_ADMIN' && req.user.role !== 'BILLING') {
    return next(
      new ErrorResponse(`Not authorized to create payroll records`, 403)
    );
  }

  // Add creator to request body
  req.body.createdBy = req.user.id;

  // Validate pay period dates
  if (new Date(req.body.payPeriodStart) >= new Date(req.body.payPeriodEnd)) {
    return next(
      new ErrorResponse(`Pay period start date must be before end date`, 400)
    );
  }

  // Find approved timesheets for this staff member within the pay period
  if (req.body.staff && req.body.payPeriodStart && req.body.payPeriodEnd) {
    const timesheets = await Timesheet.find({
      staff: req.body.staff,
      date: {
        $gte: new Date(req.body.payPeriodStart),
        $lte: new Date(req.body.payPeriodEnd)
      },
      status: 'Approved'
    });

    if (timesheets.length > 0) {
      // Add timesheets to payroll
      req.body.timesheets = timesheets.map(timesheet => timesheet._id);
      
      // Calculate total hours
      let totalHours = 0;
      timesheets.forEach(timesheet => {
        totalHours += timesheet.billableHours || 0;
      });
      
      req.body.totalHours = totalHours;
      req.body.regularHours = totalHours; // Simplified - in real app would calculate overtime
    }
  }

  const payroll = await Payroll.create(req.body);

  // Log the action
  await auditLogger.log({
    user: req.user.id,
    action: 'CREATE',
    resourceType: 'PAYROLL',
    resourceId: payroll._id,
    description: `Created payroll record for staff ID: ${payroll.staff}`,
    req
  });

  res.status(201).json({
    success: true,
    data: payroll
  });
});

// @desc      Update payroll
// @route     PUT /api/v1/payrolls/:id
// @access    Private/Admin
exports.updatePayroll = asyncHandler(async (req, res, next) => {
  // Check if user is authorized to update payroll records
  if (req.user.role !== 'PRACTICE_ADMIN' && req.user.role !== 'BILLING') {
    return next(
      new ErrorResponse(`Not authorized to update payroll records`, 403)
    );
  }

  let payroll = await Payroll.findById(req.params.id);

  if (!payroll) {
    return next(
      new ErrorResponse(`Payroll not found with id of ${req.params.id}`, 404)
    );
  }

  // Prevent updating paid payrolls
  if (payroll.status === 'Paid') {
    return next(
      new ErrorResponse(`Cannot update a paid payroll record`, 400)
    );
  }

  payroll = await Payroll.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  // Log the action
  await auditLogger.log({
    user: req.user.id,
    action: 'UPDATE',
    resourceType: 'PAYROLL',
    resourceId: payroll._id,
    description: `Updated payroll record for staff ID: ${payroll.staff}`,
    req
  });

  res.status(200).json({
    success: true,
    data: payroll
  });
});

// @desc      Delete payroll
// @route     DELETE /api/v1/payrolls/:id
// @access    Private/Admin
exports.deletePayroll = asyncHandler(async (req, res, next) => {
  // Check if user is authorized to delete payroll records
  if (req.user.role !== 'PRACTICE_ADMIN' && req.user.role !== 'BILLING') {
    return next(
      new ErrorResponse(`Not authorized to delete payroll records`, 403)
    );
  }

  const payroll = await Payroll.findById(req.params.id);

  if (!payroll) {
    return next(
      new ErrorResponse(`Payroll not found with id of ${req.params.id}`, 404)
    );
  }

  // Prevent deleting paid payrolls
  if (payroll.status === 'Paid') {
    return next(
      new ErrorResponse(`Cannot delete a paid payroll record`, 400)
    );
  }

  await payroll.remove();

  // Log the action
  await auditLogger.log({
    user: req.user.id,
    action: 'DELETE',
    resourceType: 'PAYROLL',
    resourceId: payroll._id,
    description: `Deleted payroll record for staff ID: ${payroll.staff}`,
    req
  });

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc      Approve payroll
// @route     PUT /api/v1/payrolls/:id/approve
// @access    Private/Admin
exports.approvePayroll = asyncHandler(async (req, res, next) => {
  // Check if user is authorized to approve payroll records
  if (req.user.role !== 'PRACTICE_ADMIN') {
    return next(
      new ErrorResponse(`Not authorized to approve payroll records`, 403)
    );
  }

  let payroll = await Payroll.findById(req.params.id);

  if (!payroll) {
    return next(
      new ErrorResponse(`Payroll not found with id of ${req.params.id}`, 404)
    );
  }

  // Update payroll status
  payroll = await Payroll.findByIdAndUpdate(
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
    resourceType: 'PAYROLL',
    resourceId: payroll._id,
    description: `Approved payroll record for staff ID: ${payroll.staff}`,
    req
  });

  res.status(200).json({
    success: true,
    data: payroll
  });
});

// @desc      Mark payroll as paid
// @route     PUT /api/v1/payrolls/:id/paid
// @access    Private/Admin
exports.markPayrollPaid = asyncHandler(async (req, res, next) => {
  // Check if user is authorized to mark payroll as paid
  if (req.user.role !== 'PRACTICE_ADMIN' && req.user.role !== 'BILLING') {
    return next(
      new ErrorResponse(`Not authorized to mark payroll as paid`, 403)
    );
  }

  let payroll = await Payroll.findById(req.params.id);

  if (!payroll) {
    return next(
      new ErrorResponse(`Payroll not found with id of ${req.params.id}`, 404)
    );
  }

  // Ensure payroll is approved
  if (payroll.status !== 'Approved') {
    return next(
      new ErrorResponse(`Payroll must be approved before marking as paid`, 400)
    );
  }

  // Ensure payment details are provided
  if (!req.body.paymentDate || !req.body.paymentMethod || !req.body.paymentReference) {
    return next(
      new ErrorResponse(`Please provide payment date, method, and reference`, 400)
    );
  }

  // Update payroll status
  payroll = await Payroll.findByIdAndUpdate(
    req.params.id,
    {
      status: 'Paid',
      paymentDate: req.body.paymentDate,
      paymentMethod: req.body.paymentMethod,
      paymentReference: req.body.paymentReference
    },
    {
      new: true,
      runValidators: true
    }
  );

  // Update associated timesheets to Paid status
  if (payroll.timesheets && payroll.timesheets.length > 0) {
    await Timesheet.updateMany(
      { _id: { $in: payroll.timesheets } },
      { status: 'Paid' }
    );
  }

  // Log the action
  await auditLogger.log({
    user: req.user.id,
    action: 'UPDATE',
    resourceType: 'PAYROLL',
    resourceId: payroll._id,
    description: `Marked payroll record as paid for staff ID: ${payroll.staff}`,
    req
  });

  res.status(200).json({
    success: true,
    data: payroll
  });
});
