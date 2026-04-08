const {
  generateActivationCode,
  generateCardNumber,
  generatePurchaseReference,
  generateQrCodeValue,
} = require('../../utils/identifiers');
const { AppError } = require('../../utils/app-error');
const { createPaginationMeta } = require('../../utils/pagination');

class CardService {
  constructor({ cardRepository }) {
    this.cardRepository = cardRepository;
  }

  async purchaseCard({ ownerId, payload }) {
    const existingCardForPlan = await this.cardRepository.findOwnedCardByPlan({
      ownerId,
      cardPlanId: payload.cardPlanId,
    });

    if (existingCardForPlan) {
      throw new AppError('User already owns this card plan', 409, 'CARD_PLAN_ALREADY_OWNED');
    }

    const cardPlan = await this.cardRepository.findActiveCardPlanById(payload.cardPlanId);

    if (!cardPlan) {
      throw new AppError('Card plan not found or inactive', 404, 'CARD_PLAN_NOT_FOUND');
    }

    const card = await this.cardRepository.createCard({
      title: cardPlan.name,
      description: cardPlan.description || 'Reduction card purchased from the platform',
      planNameSnapshot: cardPlan.name,
      planDescriptionSnapshot: cardPlan.description,
      planHighlightsSnapshot: cardPlan.marketingHighlights,
      planPriceSnapshot: cardPlan.price,
      status: 'INACTIVE',
      cardNumber: generateCardNumber(),
      qrCode: generateQrCodeValue(),
      activationCode: generateActivationCode(),
      purchaseReference: generatePurchaseReference(),
      price: cardPlan.price,
      cardPlanId: cardPlan.id,
      ownerId,
      offerAccessOfferIds: (cardPlan.offerLinks || []).map((link) => link.offerId),
    });

    // A purchased card becomes the user's current card immediately.
    return this.cardRepository.activateCardForOwner({ ownerId, cardId: card.id });
  }

  async activateCardByActivationCode({ ownerId, activationCode }) {
    const card = await this.cardRepository.findByOwnerIdAndActivationCode({
      ownerId,
      activationCode,
    });

    if (!card) {
      throw new AppError('Card not found for this activation code', 404, 'CARD_NOT_FOUND');
    }

    return this.activateOwnedCard({ ownerId, cardId: card.id });
  }

  async activateOwnedCard({ ownerId, cardId }) {
    const card = await this.cardRepository.findCardByIdAndOwnerId({ cardId, ownerId });

    if (!card) {
      throw new AppError('Card not found', 404, 'CARD_NOT_FOUND');
    }

    if (card.status === 'ACTIVE') {
      return card;
    }

    if (card.status === 'ARCHIVED') {
      throw new AppError('Archived cards cannot be activated', 400, 'CARD_ARCHIVED');
    }

    if (card.status === 'EXPIRED') {
      throw new AppError('Expired cards cannot be activated', 400, 'CARD_EXPIRED');
    }

    return this.cardRepository.activateCardForOwner({ ownerId, cardId: card.id });
  }

  async getMyCard(ownerId) {
    const card = await this.cardRepository.findActiveUserCard(ownerId);

    if (!card) {
      throw new AppError('No active card found for this user', 404, 'CARD_NOT_FOUND');
    }

    return card;
  }

  async listMyCards(ownerId) {
    return this.cardRepository.findCardsByOwnerId(ownerId);
  }

  async listAllCards(pagination) {
    const result = await this.cardRepository.findAllCards({ pagination });
    return {
      items: result.items,
      meta: createPaginationMeta(result),
    };
  }
}

module.exports = { CardService };


