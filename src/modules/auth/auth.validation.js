const { z } = require('zod');

const phoneNumberSchema = z
  .string()
  .trim()
  .min(8)
  .max(20)
  .regex(/^\+?[1-9]\d{7,19}$/, 'Invalid phone number format');

const authRegisterSchema = z
  .object({
    email: z.string().email().optional(),
    phoneNumber: phoneNumberSchema.optional(),
    password: z.string().min(8).max(72),
    firstName: z.string().min(1).max(100).optional(),
    lastName: z.string().min(1).max(100).optional(),
    role: z.enum(['USER', 'MERCHANT']).optional(),
  })
  .refine((data) => Boolean(data.email || data.phoneNumber), {
    message: 'Email or phone number is required',
    path: ['email'],
  });

const authLoginSchema = z
  .object({
    email: z.string().email().optional(),
    phoneNumber: phoneNumberSchema.optional(),
    password: z.string().min(8).max(72),
  })
  .refine((data) => Boolean(data.email || data.phoneNumber), {
    message: 'Email or phone number is required',
    path: ['email'],
  });

module.exports = {
  authRegisterSchema,
  authLoginSchema,
};
