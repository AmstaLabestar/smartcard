const jwt = require('jsonwebtoken');

const { env } = require('../config/env');

function authMiddleware(req, _res, next) {
  const authorization = req.headers.authorization;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    const error = new Error('Unauthorized');
    error.statusCode = 401;
    return next(error);
  }

  const token = authorization.split(' ')[1];

  try {
    const payload = jwt.verify(token, env.JWT_SECRET);
    req.user = payload;
    return next();
  } catch (_error) {
    const error = new Error('Invalid or expired token');
    error.statusCode = 401;
    return next(error);
  }
}

module.exports = { authMiddleware };
