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
  async findCurrentUserCard(ownerId) {
    return prisma.card.findFirst({
      where: {
        ownerId,
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

  async findByOwnerIdAndActivationCode({ ownerId, activationCode }) {
    return prisma.card.findFirst({
      where: {
        ownerId,
        activationCode,
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

  async activateCard(cardId) {
    return prisma.card.update({
      where: { id: cardId },
      data: {
        status: 'ACTIVE',
        activatedAt: new Date(),
      },
      include: cardInclude,
    });
  }
}

module.exports = { CardRepository };
