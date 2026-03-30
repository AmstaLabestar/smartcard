const prisma = require('../../config/prisma');

const offerCreatorSelect = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  phoneNumber: true,
  role: true,
};

const cardInclude = {
  cardPlan: {
    include: {
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
      include: cardInclude,
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
      include: cardInclude,
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
      include: cardInclude,
    });
  }

  async findCardByIdAndOwnerId({ cardId, ownerId }) {
    return prisma.card.findFirst({
      where: {
        id: cardId,
        ownerId,
      },
      include: cardInclude,
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
      include: cardInclude,
    });
  }

  async findAllCards() {
    return prisma.card.findMany({
      include: {
        ...cardInclude,
        owner: {
          select: offerCreatorSelect,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
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
      },
    });
  }

  async createCard(data) {
    return prisma.card.create({
      data,
      include: cardInclude,
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
        include: cardInclude,
      }),
    ]);

    return card;
  }
}

module.exports = { CardRepository };
