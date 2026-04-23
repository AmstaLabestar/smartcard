const { createSuccessResponse } = require('../../utils/api-response');

async function register(req, res) {
  const result = await req.container.authService.register(req.body);

  res.status(201).json(
    createSuccessResponse({
      message: 'User registered successfully',
      data: result,
    }),
  );
}

async function login(req, res) {
  const result = await req.container.authService.login(req.body);

  res.status(200).json(
    createSuccessResponse({
      message: 'Login successful',
      data: result,
    }),
  );
}

async function me(req, res) {
  const result = await req.container.authService.getProfile(req.user.sub);

  res.status(200).json(
    createSuccessResponse({
      message: 'Authenticated user fetched successfully',
      data: result,
    }),
  );
}

async function requestPasswordReset(req, res) {
  await req.container.authService.requestPasswordReset(req.body);

  res.status(200).json(
    createSuccessResponse({
      message: 'If this email belongs to a SmartCard account, a reset link has been sent',
      data: {
        acknowledged: true,
      },
    }),
  );
}

async function resetPassword(req, res) {
  await req.container.authService.resetPassword(req.body);

  res.status(200).json(
    createSuccessResponse({
      message: 'Password reset successfully',
      data: {
        acknowledged: true,
      },
    }),
  );
}

module.exports = {
  register,
  login,
  me,
  requestPasswordReset,
  resetPassword,
};
