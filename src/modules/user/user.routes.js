const express = require('express');

const { authMiddleware, requireRole } = require('../../middlewares/auth.middleware');
const { asyncHandler } = require('../../utils/async-handler');
const { validate } = require('../../utils/validators');
const userController = require('./user.controller');
const { buildUserContainer } = require('./user.container');
const { createMerchantSchema, resetPasswordSchema, updateUserStatusSchema, userListQuerySchema } = require('./user.validation');

const router = express.Router();

router.use(authMiddleware);
router.use(requireRole('ADMIN'));

router.use((req, _res, next) => {
  req.container = buildUserContainer();
  next();
});

router.get('/admin/all', asyncHandler(async (req, res) => {
  req.query = validate(userListQuerySchema, req.query);
  return userController.listUsers(req, res);
}));
router.get('/admin/merchants', asyncHandler(async (req, res) => {
  req.query = validate(userListQuerySchema, req.query);
  return userController.listMerchants(req, res);
}));
router.post(
  '/admin/merchants',
  asyncHandler(async (req, res) => {
    req.body = validate(createMerchantSchema, req.body);
    return userController.createMerchant(req, res);
  }),
);
router.patch(
  '/admin/:userId/status',
  asyncHandler(async (req, res) => {
    req.body = validate(updateUserStatusSchema, req.body);
    return userController.updateUserStatus(req, res);
  }),
);
router.patch(
  '/admin/:userId/password',
  asyncHandler(async (req, res) => {
    req.body = validate(resetPasswordSchema, req.body);
    return userController.resetUserPassword(req, res);
  }),
);

module.exports = router;
