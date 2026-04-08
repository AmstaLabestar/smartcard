const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const { env } = require('./config/env');
const apiRoutes = require('./routes');
const { getHealthLive, getHealthReady } = require('./modules/health/health.controller');
const { requestContextMiddleware } = require('./middlewares/request-context.middleware');
const { requestLoggingMiddleware } = require('./middlewares/request-logging.middleware');
const { createRateLimiter } = require('./middlewares/rate-limit.middleware');
const { notFoundMiddleware, errorMiddleware } = require('./middlewares/error.middleware');

const app = express();

const apiRateLimiter = createRateLimiter({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  maxRequests: env.RATE_LIMIT_MAX_REQUESTS,
  message: 'Too many requests. Please try again later.',
  code: 'RATE_LIMIT_EXCEEDED',
  skip: (req) => req.originalUrl.startsWith('/api/auth'),
});

const authRateLimiter = createRateLimiter({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  maxRequests: env.AUTH_RATE_LIMIT_MAX_REQUESTS,
  message: 'Too many authentication attempts. Please try again later.',
  code: 'AUTH_RATE_LIMIT_EXCEEDED',
});

app.use(requestContextMiddleware);
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  }),
);
app.use(helmet());
app.use(requestLoggingMiddleware);
app.use(express.json({ limit: env.JSON_BODY_LIMIT }));
app.use(express.urlencoded({ extended: true, limit: env.JSON_BODY_LIMIT }));

app.get('/health', getHealthLive);
app.get('/health/live', getHealthLive);
app.get('/health/ready', getHealthReady);

app.use('/api/auth', authRateLimiter);
app.use('/api', apiRateLimiter);
app.use('/api', apiRoutes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

module.exports = app;
