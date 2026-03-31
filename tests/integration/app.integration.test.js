const assert = require('node:assert/strict');
const request = require('supertest');

const app = require('../../src/app');

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
        assert.ok(response.body.timestamp);
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
