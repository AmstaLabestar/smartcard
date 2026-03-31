const { z } = require('zod');

const emptyStringToUndefined = (value) => {
  if (typeof value !== 'string') {
    return value;
  }

  const trimmedValue = value.trim();
  return trimmedValue === '' ? undefined : trimmedValue;
};

const optionalTrimmedString = (max) => z.preprocess(
  emptyStringToUndefined,
  z.string().trim().max(max).optional(),
);

const optionalSlugString = z.preprocess(
  emptyStringToUndefined,
  z.string().trim().min(2).max(120).optional(),
);

const cardPlanStatusEnum = z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED']);

const createCardPlanSchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: optionalSlugString,
  description: optionalTrimmedString(500),
  marketingHighlights: optionalTrimmedString(500),
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
