const { z } = require('zod');

const purchaseCardSchema = z.object({
  cardPlanId: z.string().uuid(),
});

const activateCardSchema = z.object({
  activationCode: z.string().min(5).max(50),
});

module.exports = {
  purchaseCardSchema,
  activateCardSchema,
};
