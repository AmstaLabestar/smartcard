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
