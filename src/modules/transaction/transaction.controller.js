const { createSuccessResponse } = require('../../utils/api-response');
const { sanitizeCard, sanitizeOffer, sanitizeTransaction, sanitizeUser } = require('../../utils/serializers');

async function previewScan(req, res) {
  const preview = await req.container.transactionService.previewScan({
    requester: req.user,
    payload: req.body,
  });

  res.status(200).json(
    createSuccessResponse({
      message: 'Card scanned successfully',
      data: {
        card: sanitizeCard(preview.card, { includeQrCode: true }),
        customer: sanitizeUser(preview.customer),
        eligibleOffers: preview.eligibleOffers.map(sanitizeOffer),
      },
    }),
  );
}

async function scanTransaction(req, res) {
  const transaction = await req.container.transactionService.scanAndCreateTransaction({
    requester: req.user,
    payload: req.body,
  });

  res.status(201).json(
    createSuccessResponse({
      message: 'Transaction created successfully',
      data: sanitizeTransaction(transaction),
    }),
  );
}

async function listMyTransactions(req, res) {
  const transactions = await req.container.transactionService.listMyTransactions({
    userId: req.user.sub,
    pagination: req.query,
  });

  res.status(200).json(
    createSuccessResponse({
      message: 'User transactions fetched successfully',
      data: transactions.items.map(sanitizeTransaction),
      meta: transactions.meta,
    }),
  );
}

async function listMerchantTransactions(req, res) {
  const transactions = await req.container.transactionService.listMerchantTransactions({
    requester: req.user,
    pagination: req.query,
  });

  res.status(200).json(
    createSuccessResponse({
      message: 'Merchant transactions fetched successfully',
      data: transactions.items.map(sanitizeTransaction),
      meta: transactions.meta,
    }),
  );
}

module.exports = {
  previewScan,
  scanTransaction,
  listMyTransactions,
  listMerchantTransactions,
};
