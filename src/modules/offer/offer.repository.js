const prisma = require('../../config/prisma');

const creatorSelect = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  phoneNumber: true,
  role: true,
};

const offerInclude = {
  creator: {
    select: creatorSelect,
  },
};

class OfferRepository {
  async createOffer(data) {
    return prisma.offer.create({
      data,
      include: offerInclude,
    });
  }

  async findActiveOffers() {
    return prisma.offer.findMany({
      where: {
        status: 'ACTIVE',
      },
      include: offerInclude,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findActiveOffersByUserId(userId) {
    const activeCard = await prisma.card.findFirst({
      where: {
        ownerId: userId,
        status: 'ACTIVE',
      },
      select: {
        id: true,
      },
    });

    if (!activeCard?.id) {
      return [];
    }

    return prisma.offer.findMany({
      where: {
        status: 'ACTIVE',
        cardAccessLinks: {
          some: {
            cardId: activeCard.id,
          },
        },
      },
      include: offerInclude,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findAllOffers() {
    return prisma.offer.findMany({
      include: offerInclude,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOffersByCreatorId(creatorId) {
    return prisma.offer.findMany({
      where: { creatorId },
      include: offerInclude,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findById(id) {
    return prisma.offer.findUnique({
      where: { id },
      include: offerInclude,
    });
  }

  async updateOfferStatus({ offerId, status }) {
    return prisma.offer.update({
      where: { id: offerId },
      data: { status },
      include: offerInclude,
    });
  }
}

module.exports = { OfferRepository };
