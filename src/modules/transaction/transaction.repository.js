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
            createdAt: true,
            updatedAt: true,
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
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });
  }

  async findRecentDuplicateTransaction({ cardId, offerId, originalAmount, duplicateWindowStart }) {
    return prisma.transaction.findFirst({
      where: {
        cardId,
        offerId,
        originalAmount,
        status: 'COMPLETED',
        createdAt: {
          gte: duplicateWindowStart,
        },
      },
      orderBy: {
        createdAt: 'desc',
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
            createdAt: true,
            updatedAt: true,
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
                createdAt: true,
                updatedAt: true,
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
                createdAt: true,
                updatedAt: true,
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
            createdAt: true,
            updatedAt: true,
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
                createdAt: true,
                updatedAt: true,
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
}

module.exports = { TransactionRepository };
