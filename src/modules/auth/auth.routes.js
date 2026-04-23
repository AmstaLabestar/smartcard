const express = require('express');

const { authMiddleware } = require('../../middlewares/auth.middleware');
const { asyncHandler } = require('../../utils/async-handler');
const { validate } = require('../../utils/validators');
const {
  authRegisterSchema,
  authLoginSchema,
  forgotPasswordSchema,
  performPasswordResetSchema,
} = require('./auth.validation');
const authController = require('./auth.controller');
const { buildAuthContainer } = require('./auth.container');

const router = express.Router();

router.use((req, _res, next) => {
  req.container = buildAuthContainer();
  next();
});

router.post(
  '/register',
  asyncHandler(async (req, res) => {
    req.body = validate(authRegisterSchema, req.body);
    return authController.register(req, res);
  }),
);

router.post(
  '/login',
  asyncHandler(async (req, res) => {
    req.body = validate(authLoginSchema, req.body);
    return authController.login(req, res);
  }),
);

router.post(
  '/forgot-password',
  asyncHandler(async (req, res) => {
    req.body = validate(forgotPasswordSchema, req.body);
    return authController.requestPasswordReset(req, res);
  }),
);

router.post(
  '/reset-password',
  asyncHandler(async (req, res) => {
    req.body = validate(performPasswordResetSchema, req.body);
    return authController.resetPassword(req, res);
  }),
);

router.get('/me', authMiddleware, asyncHandler(async (req, res) => authController.me(req, res)));

module.exports = router;
