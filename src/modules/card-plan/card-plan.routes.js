const express = require('express');

const { authMiddleware, requireRole } = require('../../middlewares/auth.middleware');
const { asyncHandler } = require('../../utils/async-handler');
const { validate } = require('../../utils/validators');
const cardPlanController = require('./card-plan.controller');
const { buildCardPlanContainer } = require('./card-plan.container');
const {
  createCardPlanSchema,
  updateCardPlanStatusSchema,
  replaceCardPlanOffersSchema,
} = require('./card-plan.validation');

const router = express.Router();

router.use((req, _res, next) => {
  req.container = buildCardPlanContainer();
  next();
});

router.get('/', asyncHandler(async (req, res) => cardPlanController.listCardPlans(req, res)));
router.get('/admin/all', authMiddleware, requireRole('ADMIN'), asyncHandler(async (req, res) => cardPlanController.listAllCardPlans(req, res)));
router.get('/:cardPlanId', asyncHandler(async (req, res) => cardPlanController.getCardPlan(req, res)));

router.post(
  '/',
  authMiddleware,
  requireRole('ADMIN'),
  asyncHandler(async (req, res) => {
    req.body = validate(createCardPlanSchema, req.body);
    return cardPlanController.createCardPlan(req, res);
  }),
);

router.patch(
  '/:cardPlanId/status',
  authMiddleware,
  requireRole('ADMIN'),
  asyncHandler(async (req, res) => {
    req.body = validate(updateCardPlanStatusSchema, req.body);
    return cardPlanController.updateCardPlanStatus(req, res);
  }),
);

router.put(
  '/:cardPlanId/offers',
  authMiddleware,
  requireRole('ADMIN'),
  asyncHandler(async (req, res) => {
    req.body = validate(replaceCardPlanOffersSchema, req.body);
    return cardPlanController.replaceCardPlanOffers(req, res);
  }),
);

module.exports = router;
