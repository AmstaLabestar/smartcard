const express = require('express');

const { authMiddleware, requireRole } = require('../../middlewares/auth.middleware');
const { asyncHandler } = require('../../utils/async-handler');
const userController = require('./user.controller');
const { buildUserContainer } = require('./user.container');

const router = express.Router();

router.use(authMiddleware);
router.use(requireRole('ADMIN'));

router.use((req, _res, next) => {
  req.container = buildUserContainer();
  next();
});

router.get('/admin/all', asyncHandler(async (req, res) => userController.listUsers(req, res)));
router.get('/admin/merchants', asyncHandler(async (req, res) => userController.listMerchants(req, res)));

module.exports = router;
