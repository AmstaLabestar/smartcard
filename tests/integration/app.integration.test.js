const assert = require('node:assert/strict');
const request = require('supertest');

const app = require('../../src/app');
const prisma = require('../../src/config/prisma');

module.exports = {
  name: 'App integration',
  type: 'integration',
  tests: [
    {
      name: 'GET /health returns the standard healthy payload',
      run: async () => {
        const response = await request(app).get('/health');

        assert.equal(response.statusCode, 200);
        assert.equal(response.body.success, true);
        assert.equal(response.body.message, 'Server is healthy');
        assert.equal(response.body.data.status, 'ok');
        assert.ok(response.body.data.timestamp);
      },
    },
    {
      name: 'GET /health/ready returns the readiness payload when the database is reachable',
      run: async () => {
        const originalQuery = prisma.$queryRawUnsafe;
        prisma.$queryRawUnsafe = async () => [{ healthy: 1 }];

        try {
          const response = await request(app).get('/health/ready');

          assert.equal(response.statusCode, 200);
          assert.equal(response.body.success, true);
          assert.equal(response.body.message, 'Server is ready');
          assert.equal(response.body.data.status, 'ready');
          assert.equal(response.body.data.checks.database, 'up');
          assert.ok(typeof response.body.data.checks.latencyMs === 'number');
        } finally {
          prisma.$queryRawUnsafe = originalQuery;
        }
      },
    },
    {
      name: 'GET /health/ready returns 503 when the database is unavailable',
      run: async () => {
        const originalQuery = prisma.$queryRawUnsafe;
        prisma.$queryRawUnsafe = async () => {
          throw new Error('database unavailable');
        };

        try {
          const response = await request(app).get('/health/ready');

          assert.equal(response.statusCode, 503);
          assert.equal(response.body.success, false);
          assert.equal(response.body.error.code, 'SERVICE_UNAVAILABLE');
          assert.equal(response.body.error.details.status, 'not_ready');
          assert.equal(response.body.error.details.database, 'down');
        } finally {
          prisma.$queryRawUnsafe = originalQuery;
        }
      },
    },
    {
      name: 'unknown routes return the standard error shape',
      run: async () => {
        const response = await request(app).get('/api/route-that-does-not-exist');

        assert.equal(response.statusCode, 404);
        assert.equal(response.body.success, false);
        assert.equal(response.body.error.code, 'NOT_FOUND');
        assert.match(response.body.error.message, /Route not found/);
        assert.ok(response.body.error.requestId);
      },
    },
  ],
};
