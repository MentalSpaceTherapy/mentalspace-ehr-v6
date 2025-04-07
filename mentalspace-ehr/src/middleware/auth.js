const jwt = require('jsonwebtoken');
const asyncHandler = require('./async');
const ErrorResponse = require('../utils/errorResponse');
const Staff = require('../models/Staff');
const config = require('../config');
const auditLogger = require('../utils/auditLogger');

// Protect routes
exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Set token from Bearer token in header
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.token) {
    // Set token from cookie
    token = req.cookies.token;
  }

  // Make sure token exists
  if (!token) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, config.jwtSecret);

    req.user = await Staff.findById(decoded.id);

    // Check if user is active
    if (!req.user.isActive) {
      return next(new ErrorResponse('Your account has been deactivated. Please contact an administrator.', 401));
    }

    next();
  } catch (err) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }
});

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `Staff role ${req.user.role} is not authorized to access this route`,
          403
        )
      );
    }
    next();
  };
};

// Log access to sensitive resources
exports.logAccess = (resourceType) => {
  return asyncHandler(async (req, res, next) => {
    // Only log read operations for sensitive data
    if (req.method === 'GET') {
      const resourceId = req.params.id || null;
      
      await auditLogger.log({
        user: req.user.id,
        action: 'READ',
        resourceType,
        resourceId,
        description: `Accessed ${resourceType.toLowerCase()} data`,
        req
      });
    }
    
    next();
  });
};
