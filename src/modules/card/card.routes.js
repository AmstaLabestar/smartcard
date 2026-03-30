const express = require('express');

const { authMiddleware, requireRole } = require('../../middlewares/auth.middleware');
const { asyncHandler } = require('../../utils/async-handler');
const { validate } = require('../../utils/validators');
const cardController = require('./card.controller');
const { buildCardContainer } = require('./card.container');
const {
  purchaseCardSchema,
  activateCardSchema,
  activateCardByIdParamsSchema,
} = require('./card.validation');

const router = express.Router();

router.use(authMiddleware);

router.use((req, _res, next) => {
  req.container = buildCardContainer();
  next();
});

router.post(
  '/purchase',
  asyncHandler(async (req, res) => {
    req.body = validate(purchaseCardSchema, req.body);
    return cardController.purchaseCard(req, res);
  }),
);

router.post(
  '/activate',
  asyncHandler(async (req, res) => {
    req.body = validate(activateCardSchema, req.body);
    return cardController.activateCard(req, res);
  }),
);

router.post(
  '/:cardId/activate',
  asyncHandler(async (req, res) => {
    req.params = validate(activateCardByIdParamsSchema, req.params);
    return cardController.activateCardById(req, res);
  }),
);

router.get('/me', asyncHandler(async (req, res) => cardController.getMyCard(req, res)));
router.get('/mine', asyncHandler(async (req, res) => cardController.listMyCards(req, res)));
router.get('/admin/all', requireRole('ADMIN'), asyncHandler(async (req, res) => cardController.listAllCards(req, res)));

module.exports = router;
