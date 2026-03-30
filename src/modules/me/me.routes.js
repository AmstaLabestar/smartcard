const express = require('express');

const { authMiddleware } = require('../../middlewares/auth.middleware');
const { asyncHandler } = require('../../utils/async-handler');
const meController = require('./me.controller');
const { buildMeContainer } = require('./me.container');

const router = express.Router();

router.use(authMiddleware);
router.use((req, _res, next) => {
  req.container = buildMeContainer();
  next();
});

router.get('/', asyncHandler(async (req, res) => meController.getMe(req, res)));
router.get('/card', asyncHandler(async (req, res) => meController.getMyCard(req, res)));
router.get('/cards', asyncHandler(async (req, res) => meController.getMyCards(req, res)));
router.get('/cards/active', asyncHandler(async (req, res) => meController.getMyActiveCard(req, res)));
router.get('/transactions', asyncHandler(async (req, res) => meController.getMyTransactions(req, res)));

module.exports = router;
