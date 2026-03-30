const { createErrorResponse } = require('../utils/api-response');
const { AppError } = require('../utils/app-error');
const { logError } = require('../utils/logger');

function notFoundMiddleware(req, _res, next) {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404, 'NOT_FOUND'));
}

function mapDefaultCode(statusCode) {
  if (statusCode === 400) return 'BAD_REQUEST';
  if (statusCode === 401) return 'UNAUTHORIZED';
  if (statusCode === 403) return 'FORBIDDEN';
  if (statusCode === 404) return 'NOT_FOUND';
  if (statusCode === 409) return 'CONFLICT';
  if (statusCode === 413) return 'PAYLOAD_TOO_LARGE';
  if (statusCode === 429) return 'TOO_MANY_REQUESTS';
  return 'INTERNAL_SERVER_ERROR';
}

function normalizeError(error) {
  if (error instanceof AppError) {
    return error;
  }

  if (error?.type === 'entity.too.large') {
    return new AppError('Payload is too large', 413, 'PAYLOAD_TOO_LARGE');
  }

  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return new AppError('Invalid JSON payload', 400, 'INVALID_JSON_PAYLOAD');
  }

  return error;
}

function errorMiddleware(error, req, res, _next) {
  const normalizedError = normalizeError(error);
  const statusCode = normalizedError.statusCode || 500;
  const code = normalizedError.code || mapDefaultCode(statusCode);
  const details = normalizedError.details || null;

  if (!(normalizedError instanceof AppError) || process.env.NODE_ENV !== 'production') {
    logError('request_failed', {
      requestId: req.requestId,
      method: req.method,
      path: req.originalUrl,
      statusCode,
      code,
      message: normalizedError.message,
    });
  }

  res.status(statusCode).json(
    createErrorResponse({
      message: normalizedError.message || 'Internal server error',
      code,
      requestId: req.requestId,
      ...(details && { details }),
    }),
  );
}

module.exports = {
  notFoundMiddleware,
  errorMiddleware,
};
