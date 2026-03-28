const { TransactionRepository } = require('./transaction.repository');
const { TransactionService } = require('./transaction.service');

function buildTransactionContainer() {
  const transactionRepository = new TransactionRepository();
  const transactionService = new TransactionService({ transactionRepository });

  return {
    transactionRepository,
    transactionService,
  };
}

module.exports = { buildTransactionContainer };
