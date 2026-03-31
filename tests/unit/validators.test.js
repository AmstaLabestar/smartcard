const assert = require('node:assert/strict');
const { z } = require('zod');

const { validate } = require('../../src/utils/validators');
const { AppError } = require('../../src/utils/app-error');

module.exports = {
  name: 'Validators',
  type: 'unit',
  tests: [
    {
      name: 'validate returns parsed data when the schema is valid',
      run: async () => {
        const schema = z.object({ amount: z.coerce.number().positive() });
        const result = validate(schema, { amount: '250' });

        assert.equal(result.amount, 250);
      },
    },
    {
      name: 'validate throws an AppError with structured details on invalid data',
      run: async () => {
        const schema = z.object({ qrCode: z.string().min(5, 'QR code invalide') });

        assert.throws(
          () => validate(schema, { qrCode: '123' }),
          (error) => {
            assert.ok(error instanceof AppError);
            assert.equal(error.code, 'VALIDATION_ERROR');
            assert.equal(error.message, 'QR code invalide');
            assert.deepEqual(error.details.fieldErrors.qrCode, ['QR code invalide']);
            return true;
          },
        );
      },
    },
  ],
};
