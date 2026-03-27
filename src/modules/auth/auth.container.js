const { AuthRepository } = require('./auth.repository');
const { AuthService } = require('./auth.service');

function buildAuthContainer() {
  const authRepository = new AuthRepository();
  const authService = new AuthService({ authRepository });

  return {
    authRepository,
    authService,
  };
}

module.exports = { buildAuthContainer };
