const { AppError } = require('../utils/app-error');

function createRateLimiter({ windowMs, maxRequests, message, code, skip }) {
  const bucket = new Map();

  return function rateLimitMiddleware(req, _res, next) {
    if (typeof skip === 'function' && skip(req)) {
      return next();
    }

    const key = `${req.ip}:${req.baseUrl || ''}:${req.path}`;
    const now = Date.now();
    const current = bucket.get(key);

    if (!current || current.expiresAt <= now) {
      bucket.set(key, { count: 1, expiresAt: now + windowMs });
      return next();
    }

    if (current.count >= maxRequests) {
      return next(new AppError(message, 429, code, { retryAfterMs: current.expiresAt - now }));
    }

    current.count += 1;
    return next();
  };
}

module.exports = { createRateLimiter };
