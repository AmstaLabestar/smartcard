const prisma = require('../../config/prisma');
const { getPaginationParams } = require('../../utils/pagination');

const offerCreatorSelect = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  phoneNumber: true,
  role: true,
};

const offerWithCreatorInclude = {
  creator: {
    select: offerCreatorSelect,
  },
};

const cardListSelect = {
  id: true,
  title: true,
  description: true,
  status: true,
  cardNumber: true,
  price: true,
  activatedAt: true,
  createdAt: true,
  updatedAt: true,
  cardPlanId: true,
  planNameSnapshot: true,
  planDescriptionSnapshot: true,
  planHighlightsSnapshot: true,
  planPriceSnapshot: true,
  cardPlan: {
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      marketingHighlights: true,
      price: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  },
};

const cardDetailInclude = {
  cardPlan: {
    include: {
      offerLinks: {
        include: {
          offer: {
            include: offerWithCreatorInclude,
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
      },
    },
  },
  offerAccesses: {
    include: {
      offer: {
        include: offerWithCreatorInclude,
      },
    },
    orderBy: {
      createdAt: 'asc',
    },
  },
};

class CardRepository {
  async findActiveUserCard(ownerId) {
    return prisma.card.findFirst({
      where: {
        ownerId,
        status: 'ACTIVE',
      },
      orderBy: {
        updatedAt: 'desc',
      },
      include: cardDetailInclude,
    });
  }

  async findCurrentUserCard(ownerId) {
    return this.findActiveUserCard(ownerId);
  }

  async findCardsByOwnerId(ownerId) {
    return prisma.card.findMany({
      where: {
        ownerId,
        status: {
          not: 'ARCHIVED',
        },
      },
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
      select: cardListSelect,
    });
  }

  async findOwnedCardByPlan({ ownerId, cardPlanId }) {
    return prisma.card.findFirst({
      where: {
        ownerId,
        cardPlanId,
        status: {
          not: 'ARCHIVED',
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: cardDetailInclude,
    });
  }

  async findCardByIdAndOwnerId({ cardId, ownerId }) {
    return prisma.card.findFirst({
      where: {
        id: cardId,
        ownerId,
      },
      include: cardDetailInclude,
    });
  }

  async findByOwnerIdAndActivationCode({ ownerId, activationCode }) {
    return prisma.card.findFirst({
      where: {
        ownerId,
        activationCode,
        status: {
          not: 'ARCHIVED',
        },
      },
      include: cardDetailInclude,
    });
  }

  async findAllCards({ pagination }) {
    const { page, limit, skip } = getPaginationParams(pagination);
    const select = {
      ...cardListSelect,
      owner: {
        select: offerCreatorSelect,
      },
    };

    const [items, total] = await prisma.$transaction([
      prisma.card.findMany({
        skip,
        take: limit,
        select,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.card.count(),
    ]);

    return { items, total, page, limit };
  }

  async findActiveCardPlanById(cardPlanId) {
    return prisma.cardPlan.findFirst({
      where: {
        id: cardPlanId,
        status: 'ACTIVE',
      },
      include: {
        offerLinks: {
          include: {
            offer: {
              include: offerWithCreatorInclude,
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });
  }

  async createCard(data) {
    const { offerAccessOfferIds = [], ...cardData } = data;

    return prisma.card.create({
      data: {
        ...cardData,
        offerAccesses:
          offerAccessOfferIds.length > 0
            ? {
                create: offerAccessOfferIds.map((offerId) => ({ offerId })),
              }
            : undefined,
      },
      include: cardDetailInclude,
    });
  }

  async activateCardForOwner({ ownerId, cardId }) {
    const activatedAt = new Date();

    const [, card] = await prisma.$transaction([
      prisma.card.updateMany({
        where: {
          ownerId,
          id: {
            not: cardId,
          },
          status: {
            in: ['ACTIVE', 'INACTIVE', 'PENDING'],
          },
        },
        data: {
          status: 'INACTIVE',
        },
      }),
      prisma.card.update({
        where: { id: cardId },
        data: {
          status: 'ACTIVE',
          activatedAt,
        },
        include: cardDetailInclude,
      }),
    ]);

    return card;
  }
}

module.exports = { CardRepository };
