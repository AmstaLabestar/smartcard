const { z } = require('zod');
const { paginationQuerySchema } = require('../../utils/pagination');

const phoneNumberSchema = z
  .string()
  .trim()
  .min(8)
  .max(20)
  .regex(/^\+?[1-9]\d{7,19}$/, 'Invalid phone number format');

const createMerchantSchema = z
  .object({
    email: z.string().email().optional(),
    phoneNumber: phoneNumberSchema.optional(),
    password: z.string().min(8).max(72),
    firstName: z.string().min(1).max(100).optional(),
    lastName: z.string().min(1).max(100).optional(),
  })
  .refine((data) => Boolean(data.email || data.phoneNumber), {
    message: 'Email or phone number is required',
    path: ['email'],
  });

module.exports = {
  createMerchantSchema,
  userListQuerySchema: paginationQuerySchema,
};
