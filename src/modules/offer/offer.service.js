const { AppError } = require('../../utils/app-error');
const { createPaginationMeta } = require('../../utils/pagination');

class OfferService {
  constructor({ offerRepository }) {
    this.offerRepository = offerRepository;
  }

  async createOffer({ creatorId, payload }) {
    return this.offerRepository.createOffer({
      title: payload.title,
      description: payload.description,
      discountType: payload.discountType,
      discountValue: payload.discountValue,
      terms: payload.terms,
      status: payload.status || 'ACTIVE',
      creatorId,
    });
  }

  async listVisibleOffers({ requester, pagination }) {
    let result;

    if (requester.role === 'USER') {
      result = await this.offerRepository.findActiveOffersByUserId({ userId: requester.sub, pagination });
    } else {
      result = await this.offerRepository.findActiveOffers({ pagination });
    }

    return {
      items: result.items,
      meta: createPaginationMeta(result),
    };
  }

  async listAllOffers(pagination) {
    const result = await this.offerRepository.findAllOffers({ pagination });
    return {
      items: result.items,
      meta: createPaginationMeta(result),
    };
  }

  async listMyOffers({ creatorId, pagination }) {
    const result = await this.offerRepository.findOffersByCreatorId({ creatorId, pagination });
    return {
      items: result.items,
      meta: createPaginationMeta(result),
    };
  }

  async updateOfferStatus({ offerId, requester, status }) {
    const offer = await this.offerRepository.findById(offerId);

    if (!offer) {
      throw new AppError('Offer not found', 404, 'OFFER_NOT_FOUND');
    }

    const isAdmin = requester.role === 'ADMIN';
    const isOwner = offer.creatorId === requester.sub;

    if (!isAdmin && !isOwner) {
      throw new AppError('Forbidden', 403, 'FORBIDDEN');
    }

    return this.offerRepository.updateOfferStatus({
      offerId,
      status,
    });
  }
}

module.exports = { OfferService };
