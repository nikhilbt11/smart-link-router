const env = require('../config/env');

// Normalizes well-known non-operational error shapes (malformed JSON, Mongoose
// errors) into a consistent { statusCode, message } pair.
function normalizeError(err) {
  if (err.isOperational) {
    return { statusCode: err.statusCode, message: err.message };
  }
  if (err.type === 'entity.parse.failed') {
    return { statusCode: 400, message: 'Malformed JSON in request body' };
  }
  if (err.name === 'CastError') {
    return { statusCode: 400, message: `Invalid value for field "${err.path}"` };
  }
  if (err.name === 'ValidationError') {
    return { statusCode: 400, message: Object.values(err.errors).map((e) => e.message).join('; ') };
  }
  return { statusCode: 500, message: 'Internal server error' };
}

// Centralized error handler. Keep this last in the middleware chain.
function errorHandler(err, req, res, next) {
  const { statusCode, message } = normalizeError(err);

  if (statusCode === 500) {
    console.error('[Unhandled Error]', err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(env.nodeEnv === 'development' && statusCode === 500 ? { stack: err.stack } : {}),
  });
}

module.exports = errorHandler;
