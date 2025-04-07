import { Request, Response, NextFunction } from 'express';
import pino from 'pino';
import pinoHttp from 'pino-http';
import { v4 as uuidv4 } from 'uuid';

// Configure the logger
const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'req.body.password',
      'req.body.ssn',
      'req.body.creditCard',
      'req.body.diagnosis',
      'res.headers["set-cookie"]'
    ],
    censor: '[REDACTED]'
  },
  timestamp: () => `,"timestamp":"${new Date().toISOString()}"`,
  base: undefined
});

// Create HTTP logger middleware
const httpLogger = pinoHttp({
  logger,
  genReqId: (req) => req.headers['x-request-id'] || uuidv4(),
  customSuccessMessage: (req, res) => {
    return `${req.method} ${req.url} completed with status ${res.statusCode}`;
  },
  customErrorMessage: (req, res, err) => {
    return `${req.method} ${req.url} failed with status ${res.statusCode}: ${err.message}`;
  },
  customLogLevel: (req, res, err) => {
    if (res.statusCode >= 500 || err) {
      return 'error';
    } else if (res.statusCode >= 400) {
      return 'warn';
    }
    return 'info';
  },
  customProps: (req, res) => {
    return {
      user: req.user?.id || 'anonymous',
      userRole: req.user?.role || 'none',
      responseTime: res.responseTime,
      contentLength: res.getHeader('content-length'),
      module: req.originalUrl.split('/')[1] || 'api'
    };
  }
});

// Create a middleware to add the logger to the request object
export const loggingMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (process.env.ENABLE_REQUEST_LOGGING !== 'false') {
    httpLogger(req, res);
  }
  
  // Add logger to request for use in route handlers
  req.logger = logger.child({ reqId: req.id });
  
  next();
};

// Create a middleware to log errors
export const errorLogger = (err: Error, req: Request, res: Response, next: NextFunction) => {
  if (req.logger) {
    req.logger.error({
      err,
      message: err.message,
      stack: err.stack,
      url: req.originalUrl,
      method: req.method,
      statusCode: res.statusCode
    }, 'Request error');
  } else {
    logger.error({
      err,
      message: err.message,
      stack: err.stack,
      url: req.originalUrl,
      method: req.method,
      statusCode: res.statusCode
    }, 'Request error');
  }
  
  next(err);
};

// Export the logger for use in other modules
export default logger;
