const { ZodError } = require('zod');

const { AppError } = require('./app-error');

function validate(schema, data) {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new AppError('Validation failed', 400, 'VALIDATION_ERROR', error.flatten());
    }

    throw error;
  }
}

module.exports = { validate };
