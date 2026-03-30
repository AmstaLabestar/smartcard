function createSuccessResponse({ message = '', data = null }) {
  return {
    success: true,
    data,
    message,
  };
}

function createErrorResponse({ message = 'Internal server error', code = 'INTERNAL_SERVER_ERROR', details = null, requestId = null }) {
  return {
    success: false,
    error: {
      message,
      code,
      ...(requestId && { requestId }),
      ...(details && { details }),
    },
  };
}

module.exports = {
  createSuccessResponse,
  createErrorResponse,
};
