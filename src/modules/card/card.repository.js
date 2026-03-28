const prisma = require('../../config/prisma');

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
    });
  }

  async findByOwnerIdAndActivationCode({ ownerId, activationCode }) {
    return prisma.card.findFirst({
      where: {
        ownerId,
        activationCode,
      },
    });
  }

  async findAllCards() {
    return prisma.card.findMany({
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phoneNumber: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async createCard(data) {
    return prisma.card.create({
      data,
    });
  }

  async activateCard(cardId) {
    return prisma.card.update({
      where: { id: cardId },
      data: {
        status: 'ACTIVE',
        activatedAt: new Date(),
      },
    });
  }
}

module.exports = { CardRepository };
