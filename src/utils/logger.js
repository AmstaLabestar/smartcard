function logInfo(event, payload = {}) {
  console.info(
    JSON.stringify({
      level: 'info',
      event,
      timestamp: new Date().toISOString(),
      ...payload,
    }),
  );
}

function logWarn(event, payload = {}) {
  console.warn(
    JSON.stringify({
      level: 'warn',
      event,
      timestamp: new Date().toISOString(),
      ...payload,
    }),
  );
}

function logError(event, payload = {}) {
  console.error(
    JSON.stringify({
      level: 'error',
      event,
      timestamp: new Date().toISOString(),
      ...payload,
    }),
  );
}

module.exports = {
  logInfo,
  logWarn,
  logError,
};
