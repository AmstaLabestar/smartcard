const { AuthRepository } = require('../auth/auth.repository');
const { CardRepository } = require('../card/card.repository');
const { TransactionRepository } = require('../transaction/transaction.repository');
const { MeService } = require('./me.service');

function buildMeContainer() {
  const authRepository = new AuthRepository();
  const cardRepository = new CardRepository();
  const transactionRepository = new TransactionRepository();
  const meService = new MeService({
    authRepository,
    cardRepository,
    transactionRepository,
  });

  return {
    authRepository,
    cardRepository,
    transactionRepository,
    meService,
  };
}

module.exports = { buildMeContainer };
