const { z } = require('zod');
const { paginationQuerySchema } = require('../../utils/pagination');

const purchaseRequestStatusEnum = z.enum(['PENDING', 'APPROVED', 'REJECTED']);

const createPurchaseRequestSchema = z.object({
  cardPlanId: z.string().uuid(),
  note: z.string().trim().max(500).optional(),
});

const purchaseRequestListQuerySchema = paginationQuerySchema.extend({
  status: purchaseRequestStatusEnum.optional(),
});

const purchaseRequestParamsSchema = z.object({
  purchaseRequestId: z.string().uuid(),
});

const rejectPurchaseRequestSchema = z.object({
  rejectionReason: z.string().trim().max(500).optional(),
});

module.exports = {
  purchaseRequestStatusEnum,
  createPurchaseRequestSchema,
  purchaseRequestListQuerySchema,
  purchaseRequestParamsSchema,
  rejectPurchaseRequestSchema,
};
