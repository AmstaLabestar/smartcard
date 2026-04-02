const express = require('express');

const { authMiddleware, requireRole } = require('../../middlewares/auth.middleware');
const { asyncHandler } = require('../../utils/async-handler');
const { validate } = require('../../utils/validators');
const userController = require('./user.controller');
const { buildUserContainer } = require('./user.container');
const { createMerchantSchema } = require('./user.validation');

const router = express.Router();

router.use(authMiddleware);
router.use(requireRole('ADMIN'));

router.use((req, _res, next) => {
  req.container = buildUserContainer();
  next();
});

router.get('/admin/all', asyncHandler(async (req, res) => userController.listUsers(req, res)));
router.get('/admin/merchants', asyncHandler(async (req, res) => userController.listMerchants(req, res)));
router.post(
  '/admin/merchants',
  asyncHandler(async (req, res) => {
    req.body = validate(createMerchantSchema, req.body);
    return userController.createMerchant(req, res);
  }),
);

module.exports = router;
