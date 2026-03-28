const { z } = require('zod');

const scanTransactionSchema = z.object({
  qrCode: z.string().min(5),
  offerId: z.string().uuid(),
  originalAmount: z.coerce.number().positive(),
});

module.exports = {
  scanTransactionSchema,
};
