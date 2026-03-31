const { ZodError } = require('zod');

const { AppError } = require('./app-error');

function formatZodIssues(issues) {
  return issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
    code: issue.code,
  }));
}

function validate(schema, data) {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof ZodError) {
      const formattedIssues = formatZodIssues(error.issues);
      const summaryMessage = formattedIssues[0]?.message || 'Validation failed';

      throw new AppError(summaryMessage, 400, 'VALIDATION_ERROR', {
        formErrors: error.flatten().formErrors,
        fieldErrors: error.flatten().fieldErrors,
        issues: formattedIssues,
      });
    }

    throw error;
  }
}

module.exports = { validate };
