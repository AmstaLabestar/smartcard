const { z } = require('zod');

const purchaseCardSchema = z.object({
  title: z.string().min(3).max(100).default('SmartCard Reduction'),
  description: z.string().max(255).optional(),
});

const activateCardSchema = z.object({
  activationCode: z.string().min(5).max(50),
});

module.exports = {
  purchaseCardSchema,
  activateCardSchema,
};
