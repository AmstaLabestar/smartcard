const { AppError } = require('../../utils/app-error');

class MeService {
  constructor({ authRepository, cardRepository, transactionRepository }) {
    this.authRepository = authRepository;
    this.cardRepository = cardRepository;
    this.transactionRepository = transactionRepository;
  }

  async getCurrentUser(userId) {
    const user = await this.authRepository.findById(userId);

    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    return this.authRepository.toPublicUser(user);
  }

  async getCurrentUserCard(userId) {
    const card = await this.cardRepository.findCurrentUserCard(userId);

    if (!card) {
      throw new AppError('No card found for this user', 404, 'CARD_NOT_FOUND');
    }

    return card;
  }

  async getCurrentUserTransactions(userId) {
    return this.transactionRepository.findTransactionsByUserId(userId);
  }
}

module.exports = { MeService };
