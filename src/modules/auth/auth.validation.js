const { z } = require('zod');

const phoneNumberSchema = z
  .string()
  .trim()
  .min(8)
  .max(20)
  .regex(/^\+?[1-9]\d{7,19}$/, 'Invalid phone number format');

const authRegisterSchema = z
  .object({
    email: z.string().trim().email().optional(),
    phoneNumber: phoneNumberSchema.optional(),
    password: z.string().min(8).max(72),
    firstName: z.string().min(1).max(100).optional(),
    lastName: z.string().min(1).max(100).optional(),
  })
  .refine((data) => Boolean(data.email || data.phoneNumber), {
    message: 'Email or phone number is required',
    path: ['email'],
  });

const authLoginSchema = z
  .object({
    email: z.string().trim().email().optional(),
    phoneNumber: phoneNumberSchema.optional(),
    password: z.string().min(8).max(72),
  })
  .refine((data) => Boolean(data.email || data.phoneNumber), {
    message: 'Email or phone number is required',
    path: ['email'],
  });

const passwordSchema = z.string().min(8).max(72);

const forgotPasswordSchema = z.object({
  email: z.string().trim().email(),
});

const performPasswordResetSchema = z.object({
  token: z.string().trim().min(32).max(512),
  newPassword: passwordSchema,
});

const resetPasswordSchema = z.object({
  newPassword: passwordSchema,
});

module.exports = {
  authRegisterSchema,
  authLoginSchema,
  passwordSchema,
  forgotPasswordSchema,
  performPasswordResetSchema,
  resetPasswordSchema,
};
