const { z } = require('zod');
const { passwordSchema } = require('../auth/auth.validation');

const changePasswordSchema = z
  .object({
    currentPassword: passwordSchema,
    newPassword: passwordSchema,
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'New password must be different from the current password',
    path: ['newPassword'],
  });

module.exports = {
  changePasswordSchema,
};
