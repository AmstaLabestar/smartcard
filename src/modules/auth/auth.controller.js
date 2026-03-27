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

module.exports = {
  register,
  login,
};
