const bcrypt = require('bcrypt');

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
    return this.getCurrentUserActiveCard(userId);
  }

  async getCurrentUserCards(userId) {
    return this.cardRepository.findCardsByOwnerId(userId);
  }

  async getCurrentUserActiveCard(userId) {
    const card = await this.cardRepository.findActiveUserCard(userId);

    if (!card) {
      throw new AppError('No active card found for this user', 404, 'CARD_NOT_FOUND');
    }

    return card;
  }

  async getCurrentUserTransactions(userId) {
    return this.transactionRepository.findTransactionsByUserId(userId);
  }

  async changeCurrentUserPassword({ userId, currentPassword, newPassword }) {
    const user = await this.authRepository.findById(userId);

    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);

    if (!isPasswordValid) {
      throw new AppError('Current password is incorrect', 400, 'INVALID_CURRENT_PASSWORD');
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    return this.authRepository.updatePasswordById(userId, passwordHash);
  }
}

module.exports = { MeService };
