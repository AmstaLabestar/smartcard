const prisma = require('../../config/prisma');

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

  async findTransactionsByUserId(userId) {
    return prisma.transaction.findMany({
      where: { userId },
      include: {
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
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}

module.exports = { TransactionRepository };
