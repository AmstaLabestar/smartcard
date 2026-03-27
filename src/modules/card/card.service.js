const {
  generateActivationCode,
  generateCardNumber,
  generatePurchaseReference,
  generateQrCodeValue,
} = require('../../utils/identifiers');
const { AppError } = require('../../utils/app-error');

class CardService {
  constructor({ cardRepository }) {
    this.cardRepository = cardRepository;
  }

  async purchaseCard({ ownerId, payload }) {
    const existingCard = await this.cardRepository.findCurrentUserCard(ownerId);

    if (existingCard) {
      throw new AppError('User already has a card', 409, 'CARD_ALREADY_EXISTS');
    }

    return this.cardRepository.createCard({
      title: payload.title || 'SmartCard Reduction',
      description: payload.description || 'Reduction card purchased from the platform',
      status: 'INACTIVE',
      cardNumber: generateCardNumber(),
      qrCode: generateQrCodeValue(),
      activationCode: generateActivationCode(),
      purchaseReference: generatePurchaseReference(),
      price: 9.99,
      ownerId,
    });
  }

  async activateCard({ ownerId, activationCode }) {
    const card = await this.cardRepository.findByOwnerIdAndActivationCode({
      ownerId,
      activationCode,
    });

    if (!card) {
      throw new AppError('Card not found for this activation code', 404, 'CARD_NOT_FOUND');
    }

    if (card.status === 'ACTIVE') {
      return card;
    }

    if (card.status === 'ARCHIVED') {
      throw new AppError('Archived cards cannot be activated', 400, 'CARD_ARCHIVED');
    }

    return this.cardRepository.activateCard(card.id);
  }

  async getMyCard(ownerId) {
    const card = await this.cardRepository.findCurrentUserCard(ownerId);

    if (!card) {
      throw new AppError('No card found for this user', 404, 'CARD_NOT_FOUND');
    }

    return card;
  }

  async listAllCards() {
    return this.cardRepository.findAllCards();
  }
}

module.exports = { CardService };
