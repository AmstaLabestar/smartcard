const jwt = require('jsonwebtoken');

const { env } = require('../config/env');
const { AppError } = require('../utils/app-error');

function authMiddleware(req, _res, next) {
  const authorization = req.headers.authorization;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return next(new AppError('Unauthorized', 401, 'UNAUTHORIZED'));
  }

  const token = authorization.split(' ')[1];

  try {
    const payload = jwt.verify(token, env.JWT_SECRET);
    req.user = payload;
    return next();
  } catch (_error) {
    return next(new AppError('Invalid or expired token', 401, 'INVALID_TOKEN'));
  }
}

function requireRole(...allowedRoles) {
  return (req, _res, next) => {
    if (!req.user) {
      return next(new AppError('Unauthorized', 401, 'UNAUTHORIZED'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError('Forbidden', 403, 'FORBIDDEN'));
    }

    return next();
  };
}

module.exports = { authMiddleware, requireRole };
