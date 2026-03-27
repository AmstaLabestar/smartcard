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

  async listActiveOffers() {
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
      const error = new Error('Offer not found');
      error.statusCode = 404;
      throw error;
    }

    const isAdmin = requester.role === 'ADMIN';
    const isOwner = offer.creatorId === requester.sub;

    if (!isAdmin && !isOwner) {
      const error = new Error('Forbidden');
      error.statusCode = 403;
      throw error;
    }

    return this.offerRepository.updateOfferStatus({
      offerId,
      status,
    });
  }
}

module.exports = { OfferService };
