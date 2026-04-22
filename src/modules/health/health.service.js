const prisma = require('../../config/prisma');

async function getReadinessStatus() {
  const startedAt = Date.now();

  await prisma.$queryRawUnsafe('SELECT 1');

  return {
    database: 'up',
    latencyMs: Date.now() - startedAt,
  };
}

function getLivenessStatus() {
  return {
    status: 'ok',
  };
}

module.exports = {
  getReadinessStatus,
  getLivenessStatus,
};
