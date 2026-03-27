const express = require('express');

const { authMiddleware, requireRole } = require('../../middlewares/auth.middleware');
const { asyncHandler } = require('../../utils/async-handler');
const { validate } = require('../../utils/validators');
const transactionController = require('./transaction.controller');
const { buildTransactionContainer } = require('./transaction.container');
const { scanTransactionSchema } = require('./transaction.validation');

const router = express.Router();

router.use(authMiddleware);

router.use((req, _res, next) => {
  req.container = buildTransactionContainer();
  next();
});

router.post(
  '/scan',
  requireRole('MERCHANT', 'ADMIN'),
  asyncHandler(async (req, res) => {
    req.body = validate(scanTransactionSchema, req.body);
    return transactionController.scanTransaction(req, res);
  }),
);

router.get('/mine', asyncHandler(async (req, res) => transactionController.listMyTransactions(req, res)));

router.get(
  '/merchant',
  requireRole('MERCHANT', 'ADMIN'),
  asyncHandler(async (req, res) => transactionController.listMerchantTransactions(req, res)),
);

module.exports = router;
