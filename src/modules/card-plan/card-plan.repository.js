const prisma = require('../../config/prisma');

const offerCreatorSelect = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  phoneNumber: true,
  role: true,
};

const cardPlanInclude = {
  offerLinks: {
    include: {
      offer: {
        include: {
          creator: {
            select: offerCreatorSelect,
          },
        },
      },
    },
    orderBy: {
      createdAt: 'asc',
    },
  },
  _count: {
    select: {
      cards: true,
      offerLinks: true,
    },
  },
};

class CardPlanRepository {
  async findActiveCardPlans() {
    return prisma.cardPlan.findMany({
      where: { status: 'ACTIVE' },
      include: cardPlanInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAllCardPlans() {
    return prisma.cardPlan.findMany({
      include: cardPlanInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id) {
    return prisma.cardPlan.findUnique({
      where: { id },
      include: cardPlanInclude,
    });
  }

  async findBySlug(slug) {
    return prisma.cardPlan.findUnique({
      where: { slug },
      include: cardPlanInclude,
    });
  }

  async createCardPlan(data) {
    const { offerIds = [], ...cardPlanData } = data;

    return prisma.cardPlan.create({
      data: {
        ...cardPlanData,
        offerLinks: offerIds.length > 0
          ? {
              create: offerIds.map((offerId) => ({ offerId })),
            }
          : undefined,
      },
      include: cardPlanInclude,
    });
  }

  async updateCardPlanStatus({ cardPlanId, status }) {
    return prisma.cardPlan.update({
      where: { id: cardPlanId },
      data: { status },
      include: cardPlanInclude,
    });
  }

  async replaceCardPlanOffers({ cardPlanId, offerIds }) {
    return prisma.cardPlan.update({
      where: { id: cardPlanId },
      data: {
        offerLinks: {
          deleteMany: {},
          ...(offerIds.length > 0
            ? {
                create: offerIds.map((offerId) => ({ offerId })),
              }
            : {}),
        },
      },
      include: cardPlanInclude,
    });
  }

  async findOffersByIds(offerIds) {
    return prisma.offer.findMany({
      where: {
        id: {
          in: offerIds,
        },
      },
    });
  }
}

module.exports = { CardPlanRepository };
