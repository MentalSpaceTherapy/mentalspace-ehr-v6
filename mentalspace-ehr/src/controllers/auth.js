const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Staff = require('../models/Staff');
const auditLogger = require('../utils/auditLogger');

// @desc      Register staff
// @route     POST /api/v1/auth/register
// @access    Private/Admin
exports.register = asyncHandler(async (req, res, next) => {
  const { firstName, lastName, email, password, role, phone } = req.body;

  // Create staff
  const staff = await Staff.create({
    firstName,
    lastName,
    email,
    password,
    role,
    phone
  });

  // Log the action
  await auditLogger.log({
    user: req.user ? req.user.id : null,
    action: 'CREATE',
    resourceType: 'STAFF',
    resourceId: staff._id,
    description: `Created new staff member: ${staff.firstName} ${staff.lastName}`,
    req
  });

  sendTokenResponse(staff, 200, res);
});

// @desc      Login staff
// @route     POST /api/v1/auth/login
// @access    Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate email & password
  if (!email || !password) {
    return next(new ErrorResponse('Please provide an email and password', 400));
  }

  // Check for staff
  const staff = await Staff.findOne({ email }).select('+password');

  if (!staff) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  // Check if staff is active
  if (!staff.isActive) {
    return next(new ErrorResponse('Your account has been deactivated. Please contact an administrator.', 401));
  }

  // Check if password matches
  const isMatch = await staff.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  // Log the action
  await auditLogger.log({
    user: staff._id,
    action: 'LOGIN',
    resourceType: 'STAFF',
    resourceId: staff._id,
    description: `Staff login: ${staff.firstName} ${staff.lastName}`,
    req
  });

  sendTokenResponse(staff, 200, res);
});

// @desc      Log staff out / clear cookie
// @route     GET /api/v1/auth/logout
// @access    Private
exports.logout = asyncHandler(async (req, res, next) => {
  // Log the action
  if (req.user) {
    await auditLogger.log({
      user: req.user.id,
      action: 'LOGOUT',
      resourceType: 'STAFF',
      resourceId: req.user.id,
      description: `Staff logout: ${req.user.firstName} ${req.user.lastName}`,
      req
    });
  }

  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc      Get current logged in staff
// @route     GET /api/v1/auth/me
// @access    Private
exports.getMe = asyncHandler(async (req, res, next) => {
  const staff = await Staff.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: staff
  });
});

// @desc      Update staff details
// @route     PUT /api/v1/auth/updatedetails
// @access    Private
exports.updateDetails = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    phone: req.body.phone
  };

  const staff = await Staff.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true
  });

  // Log the action
  await auditLogger.log({
    user: req.user.id,
    action: 'UPDATE',
    resourceType: 'STAFF',
    resourceId: req.user.id,
    description: `Updated staff details: ${staff.firstName} ${staff.lastName}`,
    req
  });

  res.status(200).json({
    success: true,
    data: staff
  });
});

// @desc      Update password
// @route     PUT /api/v1/auth/updatepassword
// @access    Private
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const staff = await Staff.findById(req.user.id).select('+password');

  // Check current password
  if (!(await staff.matchPassword(req.body.currentPassword))) {
    return next(new ErrorResponse('Password is incorrect', 401));
  }

  staff.password = req.body.newPassword;
  await staff.save();

  // Log the action
  await auditLogger.log({
    user: req.user.id,
    action: 'UPDATE',
    resourceType: 'STAFF',
    resourceId: req.user.id,
    description: 'Updated password',
    req
  });

  sendTokenResponse(staff, 200, res);
});

// @desc      Forgot password
// @route     POST /api/v1/auth/forgotpassword
// @access    Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const staff = await Staff.findOne({ email: req.body.email });

  if (!staff) {
    return next(new ErrorResponse('There is no staff with that email', 404));
  }

  // Get reset token
  const resetToken = staff.getResetPasswordToken();

  await staff.save({ validateBeforeSave: false });

  // Create reset url
  const resetUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/auth/resetpassword/${resetToken}`;

  const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

  try {
    // In a real application, send email here
    console.log(`Reset password email would be sent to ${staff.email} with message: ${message}`);

    res.status(200).json({ success: true, data: 'Email sent' });
  } catch (err) {
    console.log(err);
    staff.resetPasswordToken = undefined;
    staff.resetPasswordExpire = undefined;

    await staff.save({ validateBeforeSave: false });

    return next(new ErrorResponse('Email could not be sent', 500));
  }
});

// @desc      Reset password
// @route     PUT /api/v1/auth/resetpassword/:resettoken
// @access    Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  // Get hashed token
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resettoken)
    .digest('hex');

  const staff = await Staff.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() }
  });

  if (!staff) {
    return next(new ErrorResponse('Invalid token', 400));
  }

  // Set new password
  staff.password = req.body.password;
  staff.resetPasswordToken = undefined;
  staff.resetPasswordExpire = undefined;
  await staff.save();

  // Log the action
  await auditLogger.log({
    user: staff._id,
    action: 'UPDATE',
    resourceType: 'STAFF',
    resourceId: staff._id,
    description: 'Reset password',
    req
  });

  sendTokenResponse(staff, 200, res);
});

// Get token from model, create cookie and send response
const sendTokenResponse = (staff, statusCode, res) => {
  // Create token
  const token = staff.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token
    });
};
