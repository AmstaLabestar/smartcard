const { createSuccessResponse } = require('../../utils/api-response');

async function scanTransaction(req, res) {
  const transaction = await req.container.transactionService.scanAndCreateTransaction({
    requester: req.user,
    payload: req.body,
  });

  res.status(201).json(
    createSuccessResponse({
      message: 'Transaction created successfully',
      data: transaction,
    }),
  );
}

async function listMyTransactions(req, res) {
  const transactions = await req.container.transactionService.listMyTransactions(req.user.sub);

  res.status(200).json(
    createSuccessResponse({
      message: 'User transactions fetched successfully',
      data: transactions,
    }),
  );
}

async function listMerchantTransactions(req, res) {
  const transactions = await req.container.transactionService.listMerchantTransactions(req.user);

  res.status(200).json(
    createSuccessResponse({
      message: 'Merchant transactions fetched successfully',
      data: transactions,
    }),
  );
}

module.exports = {
  scanTransaction,
  listMyTransactions,
  listMerchantTransactions,
};
