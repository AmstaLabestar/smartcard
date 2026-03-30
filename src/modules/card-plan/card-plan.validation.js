const { z } = require('zod');

const cardPlanStatusEnum = z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED']);

const createCardPlanSchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: z.string().trim().min(2).max(120).optional(),
  description: z.string().trim().max(500).optional(),
  marketingHighlights: z.string().trim().max(500).optional(),
  price: z.coerce.number().positive().max(100000),
  status: cardPlanStatusEnum.optional(),
  offerIds: z.array(z.string().uuid()).optional().default([]),
});

const updateCardPlanStatusSchema = z.object({
  status: cardPlanStatusEnum,
});

const replaceCardPlanOffersSchema = z.object({
  offerIds: z.array(z.string().uuid()).default([]),
});

module.exports = {
  createCardPlanSchema,
  updateCardPlanStatusSchema,
  replaceCardPlanOffersSchema,
};
