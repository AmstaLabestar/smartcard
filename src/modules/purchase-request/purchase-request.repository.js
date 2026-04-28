const prisma = require('../../config/prisma');
const { getPaginationParams } = require('../../utils/pagination');

const userSelect = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  phoneNumber: true,
  role: true,
  status: true,
  createdAt: true,
  updatedAt: true,
};

const cardPlanSelect = {
  id: true,
  name: true,
  slug: true,
  description: true,
  marketingHighlights: true,
  price: true,
  status: true,
  createdAt: true,
  updatedAt: true,
};

const issuedCardSelect = {
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
};

const purchaseRequestInclude = {
  user: {
    select: userSelect,
  },
  reviewedBy: {
    select: userSelect,
  },
  cardPlan: {
    select: cardPlanSelect,
  },
  issuedCard: {
    select: issuedCardSelect,
  },
};

class PurchaseRequestRepository {
  async findPendingRequestByUserAndPlan({ userId, cardPlanId }) {
    return prisma.purchaseRequest.findFirst({
      where: {
        userId,
        cardPlanId,
        status: 'PENDING',
      },
      include: purchaseRequestInclude,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async createPurchaseRequest({ userId, cardPlanId, note }) {
    return prisma.purchaseRequest.create({
      data: {
        userId,
        cardPlanId,
        note,
      },
      include: purchaseRequestInclude,
    });
  }

  async findById(id) {
    return prisma.purchaseRequest.findUnique({
      where: { id },
      include: purchaseRequestInclude,
    });
  }

  async findUserPurchaseRequests({ userId, pagination, status }) {
    const where = {
      userId,
      ...(status ? { status } : {}),
    };
    const { page, limit, skip } = getPaginationParams(pagination);

    const [items, total] = await prisma.$transaction([
      prisma.purchaseRequest.findMany({
        where,
        skip,
        take: limit,
        include: purchaseRequestInclude,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.purchaseRequest.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  async findAllPurchaseRequests({ pagination, status }) {
    const where = status ? { status } : undefined;
    const { page, limit, skip } = getPaginationParams(pagination);

    const [items, total] = await prisma.$transaction([
      prisma.purchaseRequest.findMany({
        where,
        skip,
        take: limit,
        include: purchaseRequestInclude,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.purchaseRequest.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  async approvePurchaseRequest({ purchaseRequestId, reviewedById, issuedCardId }) {
    return prisma.purchaseRequest.update({
      where: { id: purchaseRequestId },
      data: {
        status: 'APPROVED',
        reviewedById,
        reviewedAt: new Date(),
        issuedCardId,
        rejectionReason: null,
      },
      include: purchaseRequestInclude,
    });
  }

  async rejectPurchaseRequest({ purchaseRequestId, reviewedById, rejectionReason }) {
    return prisma.purchaseRequest.update({
      where: { id: purchaseRequestId },
      data: {
        status: 'REJECTED',
        reviewedById,
        reviewedAt: new Date(),
        rejectionReason: rejectionReason || null,
      },
      include: purchaseRequestInclude,
    });
  }
}

module.exports = { PurchaseRequestRepository };
