const prisma = require('../../config/prisma');

class TransactionRepository {
  async findCardByQrCode(qrCode) {
    return prisma.card.findUnique({
      where: { qrCode },
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
    });
  }

  async findOfferById(offerId) {
    return prisma.offer.findUnique({
      where: { id: offerId },
      include: {
        creator: {
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
    });
  }

  async createTransaction(data) {
    return prisma.transaction.create({
      data,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phoneNumber: true,
            role: true,
          },
        },
        card: true,
        offer: {
          include: {
            creator: {
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
        },
      },
    });
  }

  async findTransactionsByUserId(userId) {
    return prisma.transaction.findMany({
      where: { userId },
      include: {
        card: true,
        offer: {
          include: {
            creator: {
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
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findTransactionsByMerchantId(merchantId) {
    return prisma.transaction.findMany({
      where: {
        offer: {
          creatorId: merchantId,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phoneNumber: true,
            role: true,
          },
        },
        card: true,
        offer: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}

module.exports = { TransactionRepository };
