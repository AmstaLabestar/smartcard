const { ZodError } = require('zod');

function validate(schema, data) {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof ZodError) {
      const validationError = new Error('Validation failed');
      validationError.statusCode = 400;
      validationError.details = error.flatten();
      throw validationError;
    }

    throw error;
  }
}

module.exports = { validate };
