function createSuccessResponse({ message, data = null }) {
  return {
    success: true,
    message,
    data,
  };
}

module.exports = { createSuccessResponse };
