const { AppError } = require('../../utils/app-error');

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

  async listVisibleOffers(requester) {
    if (requester.role === 'USER') {
      return this.offerRepository.findActiveOffersByUserId(requester.sub);
    }

    return this.offerRepository.findActiveOffers();
  }

  async listAllOffers() {
    return this.offerRepository.findAllOffers();
  }

  async listMyOffers(creatorId) {
    return this.offerRepository.findOffersByCreatorId(creatorId);
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
