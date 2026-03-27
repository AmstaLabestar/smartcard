const {
  generateActivationCode,
  generateCardNumber,
  generatePurchaseReference,
  generateQrCodeValue,
} = require('../../utils/identifiers');

class CardService {
  constructor({ cardRepository }) {
    this.cardRepository = cardRepository;
  }

  async purchaseCard({ ownerId, payload }) {
    const existingCard = await this.cardRepository.findCurrentUserCard(ownerId);

    if (existingCard) {
      const error = new Error('User already has a card');
      error.statusCode = 409;
      throw error;
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
      const error = new Error('Card not found for this activation code');
      error.statusCode = 404;
      throw error;
    }

    if (card.status === 'ACTIVE') {
      return card;
    }

    if (card.status === 'ARCHIVED') {
      const error = new Error('Archived cards cannot be activated');
      error.statusCode = 400;
      throw error;
    }

    return this.cardRepository.activateCard(card.id);
  }

  async getMyCard(ownerId) {
    const card = await this.cardRepository.findCurrentUserCard(ownerId);

    if (!card) {
      const error = new Error('No card found for this user');
      error.statusCode = 404;
      throw error;
    }

    return card;
  }
}

module.exports = { CardService };
