'use strict';

/**
 * PUBLIC_INTERFACE
 * errorHandler
 * This is an Express error handling middleware that standardizes JSON error responses.
 * It captures known validation errors and unexpected errors, returning appropriate status codes.
 */
function errorHandler(err, req, res, next) {
  // If response headers already sent, delegate to default handler
  if (res.headersSent) return next(err);

  const status = err.status || err.statusCode || 500;
  const code = err.code || (status >= 500 ? 'INTERNAL_ERROR' : 'REQUEST_ERROR');

  const payload = {
    status: 'error',
    code,
    message: err.message || 'Internal Server Error',
  };

  if (err.details) {
    payload.details = err.details; // validation details, etc.
  }

  res.status(status).json(payload);
}

/**
 * Helper to create a 404 handler.
 */
function notFoundHandler(req, res, next) {
  const err = new Error(`Route ${req.method} ${req.originalUrl} not found`);
  err.status = 404;
  err.code = 'NOT_FOUND';
  next(err);
}

/**
 * Helper to create a validation error object.
 */
function validationError(message, details) {
  const err = new Error(message || 'Validation error');
  err.status = 400;
  err.code = 'VALIDATION_ERROR';
  if (details) err.details = details;
  return err;
}

module.exports = {
  errorHandler,
  notFoundHandler,
  validationError,
};
