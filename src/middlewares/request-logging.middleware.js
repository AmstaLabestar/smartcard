const { logInfo, logWarn, logError } = require('../utils/logger');

function requestLoggingMiddleware(req, res, next) {
  const startedAt = process.hrtime.bigint();

  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;
    const payload = {
      requestId: req.requestId,
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: Number(durationMs.toFixed(2)),
      userAgent: req.get('user-agent') || 'unknown',
    };

    if (res.statusCode >= 500) {
      logError('request_completed', payload);
      return;
    }

    if (res.statusCode >= 400) {
      logWarn('request_completed', payload);
      return;
    }

    logInfo('request_completed', payload);
  });

  next();
}

module.exports = { requestLoggingMiddleware };
