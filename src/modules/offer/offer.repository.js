const prisma = require('../../config/prisma');
const { getPaginationParams } = require('../../utils/pagination');

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

  async findActiveOffers({ pagination }) {
    const where = {
      status: 'ACTIVE',
    };
    const { page, limit, skip } = getPaginationParams(pagination);

    const [items, total] = await prisma.$transaction([
      prisma.offer.findMany({
        where,
        skip,
        take: limit,
        include: offerInclude,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.offer.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  async findActiveOffersByUserId({ userId, pagination }) {
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
      const { page, limit } = getPaginationParams(pagination);
      return { items: [], total: 0, page, limit };
    }

    const where = {
      status: 'ACTIVE',
      cardAccessLinks: {
        some: {
          cardId: activeCard.id,
        },
      },
    };
    const { page, limit, skip } = getPaginationParams(pagination);

    const [items, total] = await prisma.$transaction([
      prisma.offer.findMany({
        where,
        skip,
        take: limit,
        include: offerInclude,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.offer.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  async findAllOffers({ pagination }) {
    const { page, limit, skip } = getPaginationParams(pagination);

    const [items, total] = await prisma.$transaction([
      prisma.offer.findMany({
        skip,
        take: limit,
        include: offerInclude,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.offer.count(),
    ]);

    return { items, total, page, limit };
  }

  async findOffersByCreatorId({ creatorId, pagination }) {
    const where = { creatorId };
    const { page, limit, skip } = getPaginationParams(pagination);

    const [items, total] = await prisma.$transaction([
      prisma.offer.findMany({
        where,
        skip,
        take: limit,
        include: offerInclude,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.offer.count({ where }),
    ]);

    return { items, total, page, limit };
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
