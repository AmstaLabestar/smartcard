const { createSuccessResponse, createErrorResponse } = require('../../utils/api-response');
const { env } = require('../../config/env');
const { getReadinessStatus, getLivenessStatus } = require('./health.service');

async function getHealthLive(_req, res) {
  res.status(200).json(
    createSuccessResponse({
        message: 'Server is healthy',
        data: {
          ...getLivenessStatus(),
          environment: env.NODE_ENV,
          timestamp: new Date().toISOString(),
        },
      }),
  );
}

async function getHealthReady(_req, res) {
  try {
    const readiness = await getReadinessStatus();

    res.status(200).json(
      createSuccessResponse({
        message: 'Server is ready',
        data: {
          status: 'ready',
          environment: env.NODE_ENV,
          timestamp: new Date().toISOString(),
          checks: readiness,
        },
      }),
    );
  } catch {
    res.status(503).json(
      createErrorResponse({
        message: 'Server is not ready',
        code: 'SERVICE_UNAVAILABLE',
        details: {
          status: 'not_ready',
          database: 'down',
        },
      }),
    );
  }
}

module.exports = {
  getHealthLive,
  getHealthReady,
};
