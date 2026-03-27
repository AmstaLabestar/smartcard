const { createErrorResponse } = require('../utils/api-response');
const { AppError } = require('../utils/app-error');

function notFoundMiddleware(req, _res, next) {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404, 'NOT_FOUND'));
}

function mapDefaultCode(statusCode) {
  if (statusCode === 400) return 'BAD_REQUEST';
  if (statusCode === 401) return 'UNAUTHORIZED';
  if (statusCode === 403) return 'FORBIDDEN';
  if (statusCode === 404) return 'NOT_FOUND';
  return 'INTERNAL_SERVER_ERROR';
}

function errorMiddleware(error, _req, res, _next) {
  const statusCode = error.statusCode || 500;
  const code = error.code || mapDefaultCode(statusCode);
  const details = error.details || null;

  if (!(error instanceof AppError) && process.env.NODE_ENV !== 'production') {
    console.error('Unhandled error', error);
  }

  res.status(statusCode).json(
    createErrorResponse({
      message: error.message || 'Internal server error',
      code,
      ...(details && { details }),
    }),
  );
}

module.exports = {
  notFoundMiddleware,
  errorMiddleware,
};
