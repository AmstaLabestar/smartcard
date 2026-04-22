const prisma = require('../../config/prisma');
const { getPaginationParams } = require('../../utils/pagination');

const personSelect = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  phoneNumber: true,
  role: true,
  createdAt: true,
  updatedAt: true,
};

const offerAccessInclude = {
  include: {
    offer: {
      include: {
        creator: {
          select: personSelect,
        },
      },
    },
  },
};

const transactionListCardSelect = {
  id: true,
  title: true,
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

const transactionListInclude = {
  user: {
    select: personSelect,
  },
  card: {
    select: transactionListCardSelect,
  },
  offer: {
    include: {
      creator: {
        select: personSelect,
      },
    },
  },
};

class TransactionRepository {
  async findCardByQrCode(qrCode) {
    return prisma.card.findUnique({
      where: { qrCode },
      include: {
        owner: {
          select: personSelect,
        },
        cardPlan: {
          include: {
            offerLinks: {
              select: {
                offerId: true,
              },
            },
          },
        },
        offerAccesses: {
          ...offerAccessInclude,
          orderBy: {
            createdAt: 'asc',
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
          select: personSelect,
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
          select: personSelect,
        },
        card: {
          include: {
            cardPlan: {
              include: {
                offerLinks: {
                  include: {
                    offer: {
                      include: {
                        creator: {
                          select: personSelect,
                        },
                      },
                    },
                  },
                },
              },
            },
            offerAccesses: {
              ...offerAccessInclude,
              orderBy: {
                createdAt: 'asc',
              },
            },
          },
        },
        offer: {
          include: {
            creator: {
              select: personSelect,
            },
          },
        },
      },
    });
  }

  async findTransactionsByUserId({ userId, pagination }) {
    const where = { userId };
    const { page, limit, skip } = getPaginationParams(pagination);

    const [items, total] = await prisma.$transaction([
      prisma.transaction.findMany({
        where,
        skip,
        take: limit,
        include: transactionListInclude,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.transaction.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  async findTransactionsByMerchantId({ merchantId, pagination }) {
    const where = {
      offer: {
        creatorId: merchantId,
      },
    };
    const { page, limit, skip } = getPaginationParams(pagination);

    const [items, total] = await prisma.$transaction([
      prisma.transaction.findMany({
        where,
        skip,
        take: limit,
        include: transactionListInclude,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.transaction.count({ where }),
    ]);

    return { items, total, page, limit };
  }
}

module.exports = { TransactionRepository };
