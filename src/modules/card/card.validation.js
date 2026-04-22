const { z } = require('zod');
const { paginationQuerySchema } = require('../../utils/pagination');

const purchaseCardSchema = z.object({
  cardPlanId: z.string().uuid(),
});

const activateCardSchema = z.object({
  activationCode: z.string().min(5).max(50),
});

const activateCardByIdParamsSchema = z.object({
  cardId: z.string().uuid(),
});

module.exports = {
  purchaseCardSchema,
  activateCardSchema,
  activateCardByIdParamsSchema,
  cardListQuerySchema: paginationQuerySchema,
};
