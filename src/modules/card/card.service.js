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

    const cardPlan = await this.cardRepository.findActiveCardPlanById(payload.cardPlanId);

    if (!cardPlan) {
      throw new AppError('Card plan not found or inactive', 404, 'CARD_PLAN_NOT_FOUND');
    }

    return this.cardRepository.createCard({
      title: cardPlan.name,
      description: cardPlan.description || 'Reduction card purchased from the platform',
      status: 'INACTIVE',
      cardNumber: generateCardNumber(),
      qrCode: generateQrCodeValue(),
      activationCode: generateActivationCode(),
      purchaseReference: generatePurchaseReference(),
      price: cardPlan.price,
      cardPlanId: cardPlan.id,
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
