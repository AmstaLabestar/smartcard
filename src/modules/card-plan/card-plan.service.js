const { AppError } = require('../../utils/app-error');

function slugify(value) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .trim();
}

function mapCardPlan(cardPlan) {
  return {
    id: cardPlan.id,
    name: cardPlan.name,
    slug: cardPlan.slug,
    description: cardPlan.description,
    marketingHighlights: cardPlan.marketingHighlights,
    price: cardPlan.price,
    status: cardPlan.status,
    offersCount: cardPlan._count?.offerLinks ?? cardPlan.offerLinks?.length ?? 0,
    ownedCardsCount: cardPlan._count?.cards ?? 0,
    offers: (cardPlan.offerLinks || []).map((link) => link.offer),
    createdAt: cardPlan.createdAt,
    updatedAt: cardPlan.updatedAt,
  };
}

class CardPlanService {
  constructor({ cardPlanRepository }) {
    this.cardPlanRepository = cardPlanRepository;
  }

  async listPublicCardPlans() {
    const cardPlans = await this.cardPlanRepository.findActiveCardPlans();
    return cardPlans.map(mapCardPlan);
  }

  async listAllCardPlans() {
    const cardPlans = await this.cardPlanRepository.findAllCardPlans();
    return cardPlans.map(mapCardPlan);
  }

  async getPublicCardPlan(cardPlanId) {
    const cardPlan = await this.cardPlanRepository.findById(cardPlanId);

    if (!cardPlan || cardPlan.status !== 'ACTIVE') {
      throw new AppError('Card plan not found', 404, 'CARD_PLAN_NOT_FOUND');
    }

    return mapCardPlan(cardPlan);
  }

  async createCardPlan(payload) {
    const slug = payload.slug || slugify(payload.name);

    if (!slug) {
      throw new AppError('Unable to generate a valid slug for this card plan', 400, 'INVALID_CARD_PLAN_SLUG');
    }

    const existingCardPlan = await this.cardPlanRepository.findBySlug(slug);

    if (existingCardPlan) {
      throw new AppError('A card plan with this slug already exists', 409, 'CARD_PLAN_SLUG_ALREADY_EXISTS');
    }

    const offerIds = payload.offerIds || [];

    if (offerIds.length > 0) {
      const offers = await this.cardPlanRepository.findOffersByIds(offerIds);

      if (offers.length !== offerIds.length) {
        throw new AppError('One or more offers do not exist', 400, 'INVALID_CARD_PLAN_OFFERS');
      }
    }

    const cardPlan = await this.cardPlanRepository.createCardPlan({
      name: payload.name,
      slug,
      description: payload.description,
      marketingHighlights: payload.marketingHighlights,
      price: payload.price,
      status: payload.status || 'DRAFT',
      offerIds,
    });

    return mapCardPlan(cardPlan);
  }

  async updateCardPlanStatus({ cardPlanId, status }) {
    const existingCardPlan = await this.cardPlanRepository.findById(cardPlanId);

    if (!existingCardPlan) {
      throw new AppError('Card plan not found', 404, 'CARD_PLAN_NOT_FOUND');
    }

    const cardPlan = await this.cardPlanRepository.updateCardPlanStatus({
      cardPlanId,
      status,
    });

    return mapCardPlan(cardPlan);
  }

  async replaceCardPlanOffers({ cardPlanId, offerIds }) {
    const existingCardPlan = await this.cardPlanRepository.findById(cardPlanId);

    if (!existingCardPlan) {
      throw new AppError('Card plan not found', 404, 'CARD_PLAN_NOT_FOUND');
    }

    const offers = await this.cardPlanRepository.findOffersByIds(offerIds);

    if (offers.length !== offerIds.length) {
      throw new AppError('One or more offers do not exist', 400, 'INVALID_CARD_PLAN_OFFERS');
    }

    const cardPlan = await this.cardPlanRepository.replaceCardPlanOffers({
      cardPlanId,
      offerIds,
    });

    return mapCardPlan(cardPlan);
  }
}

module.exports = { CardPlanService };
