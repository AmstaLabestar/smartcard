const { AuthRepository } = require('./auth.repository');
const { AuthService } = require('./auth.service');
const { PasswordResetEmailService } = require('./password-reset-email.service');

function buildAuthContainer() {
  const authRepository = new AuthRepository();
  const passwordResetEmailService = new PasswordResetEmailService();
  const authService = new AuthService({ authRepository, passwordResetEmailService });

  return {
    authRepository,
    passwordResetEmailService,
    authService,
  };
}

module.exports = { buildAuthContainer };
