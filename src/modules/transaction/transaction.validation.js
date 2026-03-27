const { z } = require('zod');

const scanTransactionSchema = z.object({
  qrCode: z.string().min(20).max(100),
  offerId: z.string().uuid(),
  originalAmount: z.coerce.number().positive().max(100000),
});

module.exports = {
  scanTransactionSchema,
};
