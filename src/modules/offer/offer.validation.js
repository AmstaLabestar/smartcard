const { z } = require('zod');
const { paginationQuerySchema } = require('../../utils/pagination');

const createOfferSchema = z.object({
  title: z.string().min(3).max(120),
  description: z.string().max(500).optional(),
  discountType: z.enum(['PERCENTAGE', 'FIXED']),
  discountValue: z.coerce.number().positive(),
  terms: z.string().max(500).optional(),
  status: z.enum(['DRAFT', 'ACTIVE']).optional(),
});

const updateOfferStatusSchema = z.object({
  status: z.enum(['DRAFT', 'ACTIVE', 'EXPIRED']),
});

module.exports = {
  createOfferSchema,
  offerListQuerySchema: paginationQuerySchema,
  updateOfferStatusSchema,
};
