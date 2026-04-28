const express = require('express');

const { authMiddleware, requireRole } = require('../../middlewares/auth.middleware');
const { asyncHandler } = require('../../utils/async-handler');
const { validate } = require('../../utils/validators');
const purchaseRequestController = require('./purchase-request.controller');
const { buildPurchaseRequestContainer } = require('./purchase-request.container');
const {
  createPurchaseRequestSchema,
  purchaseRequestListQuerySchema,
  purchaseRequestParamsSchema,
  rejectPurchaseRequestSchema,
} = require('./purchase-request.validation');

const router = express.Router();

router.use(authMiddleware);

router.use((req, _res, next) => {
  req.container = buildPurchaseRequestContainer();
  next();
});

router.post(
  '/',
  requireRole('USER'),
  asyncHandler(async (req, res) => {
    req.body = validate(createPurchaseRequestSchema, req.body);
    return purchaseRequestController.createPurchaseRequest(req, res);
  }),
);

router.get(
  '/me',
  requireRole('USER'),
  asyncHandler(async (req, res) => {
    req.query = validate(purchaseRequestListQuerySchema, req.query);
    return purchaseRequestController.listMyPurchaseRequests(req, res);
  }),
);

router.get(
  '/admin/all',
  requireRole('ADMIN'),
  asyncHandler(async (req, res) => {
    req.query = validate(purchaseRequestListQuerySchema, req.query);
    return purchaseRequestController.listAllPurchaseRequests(req, res);
  }),
);

router.patch(
  '/admin/:purchaseRequestId/approve',
  requireRole('ADMIN'),
  asyncHandler(async (req, res) => {
    req.params = validate(purchaseRequestParamsSchema, req.params);
    return purchaseRequestController.approvePurchaseRequest(req, res);
  }),
);

router.patch(
  '/admin/:purchaseRequestId/reject',
  requireRole('ADMIN'),
  asyncHandler(async (req, res) => {
    req.params = validate(purchaseRequestParamsSchema, req.params);
    req.body = validate(rejectPurchaseRequestSchema, req.body);
    return purchaseRequestController.rejectPurchaseRequest(req, res);
  }),
);

module.exports = router;
