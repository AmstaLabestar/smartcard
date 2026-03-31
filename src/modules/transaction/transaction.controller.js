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
  const transactions = await req.container.transactionService.listMyTransactions(req.user.sub);

  res.status(200).json(
    createSuccessResponse({
      message: 'User transactions fetched successfully',
      data: transactions.map(sanitizeTransaction),
    }),
  );
}

async function listMerchantTransactions(req, res) {
  const transactions = await req.container.transactionService.listMerchantTransactions(req.user);

  res.status(200).json(
    createSuccessResponse({
      message: 'Merchant transactions fetched successfully',
      data: transactions.map(sanitizeTransaction),
    }),
  );
}

module.exports = {
  previewScan,
  scanTransaction,
  listMyTransactions,
  listMerchantTransactions,
};
