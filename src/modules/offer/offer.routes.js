const express = require('express');

const { authMiddleware, requireRole } = require('../../middlewares/auth.middleware');
const { asyncHandler } = require('../../utils/async-handler');
const { validate } = require('../../utils/validators');
const offerController = require('./offer.controller');
const { buildOfferContainer } = require('./offer.container');
const { createOfferSchema, offerListQuerySchema, updateOfferStatusSchema } = require('./offer.validation');

const router = express.Router();

router.use((req, _res, next) => {
  req.container = buildOfferContainer();
  next();
});

router.get('/', authMiddleware, asyncHandler(async (req, res) => {
  req.query = validate(offerListQuerySchema, req.query);
  return offerController.listOffers(req, res);
}));
router.get('/admin/all', authMiddleware, requireRole('ADMIN'), asyncHandler(async (req, res) => {
  req.query = validate(offerListQuerySchema, req.query);
  return offerController.listAllOffers(req, res);
}));

router.get(
  '/mine',
  authMiddleware,
  requireRole('MERCHANT', 'ADMIN'),
  asyncHandler(async (req, res) => {
    req.query = validate(offerListQuerySchema, req.query);
    return offerController.listMyOffers(req, res);
  }),
);

router.post(
  '/',
  authMiddleware,
  requireRole('MERCHANT', 'ADMIN'),
  asyncHandler(async (req, res) => {
    req.body = validate(createOfferSchema, req.body);
    return offerController.createOffer(req, res);
  }),
);

router.patch(
  '/:offerId/status',
  authMiddleware,
  requireRole('MERCHANT', 'ADMIN'),
  asyncHandler(async (req, res) => {
    req.body = validate(updateOfferStatusSchema, req.body);
    return offerController.updateOfferStatus(req, res);
  }),
);

module.exports = router;
