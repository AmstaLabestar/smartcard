const { AppError } = require('../../utils/app-error');
const { createPaginationMeta } = require('../../utils/pagination');

class PurchaseRequestService {
  constructor({ purchaseRequestRepository, cardRepository, cardService }) {
    this.purchaseRequestRepository = purchaseRequestRepository;
    this.cardRepository = cardRepository;
    this.cardService = cardService;
  }

  async createPurchaseRequest({ userId, payload }) {
    const existingCardForPlan = await this.cardRepository.findOwnedCardByPlan({
      ownerId: userId,
      cardPlanId: payload.cardPlanId,
    });

    if (existingCardForPlan) {
      throw new AppError('User already owns this card plan', 409, 'CARD_PLAN_ALREADY_OWNED');
    }

    const cardPlan = await this.cardRepository.findActiveCardPlanById(payload.cardPlanId);

    if (!cardPlan) {
      throw new AppError('Card plan not found or inactive', 404, 'CARD_PLAN_NOT_FOUND');
    }

    const existingPendingRequest =
      await this.purchaseRequestRepository.findPendingRequestByUserAndPlan({
        userId,
        cardPlanId: payload.cardPlanId,
      });

    if (existingPendingRequest) {
      throw new AppError(
        'A purchase request is already pending for this card plan',
        409,
        'PURCHASE_REQUEST_ALREADY_PENDING',
      );
    }

    return this.purchaseRequestRepository.createPurchaseRequest({
      userId,
      cardPlanId: payload.cardPlanId,
      note: payload.note,
    });
  }

  async listMyPurchaseRequests({ userId, pagination, status }) {
    const result = await this.purchaseRequestRepository.findUserPurchaseRequests({
      userId,
      pagination,
      status,
    });

    return {
      items: result.items,
      meta: createPaginationMeta(result),
    };
  }

  async listAllPurchaseRequests({ pagination, status }) {
    const result = await this.purchaseRequestRepository.findAllPurchaseRequests({
      pagination,
      status,
    });

    return {
      items: result.items,
      meta: createPaginationMeta(result),
    };
  }

  async approvePurchaseRequest({ purchaseRequestId, reviewerId }) {
    const purchaseRequest = await this.purchaseRequestRepository.findById(purchaseRequestId);

    if (!purchaseRequest) {
      throw new AppError('Purchase request not found', 404, 'PURCHASE_REQUEST_NOT_FOUND');
    }

    if (purchaseRequest.status !== 'PENDING') {
      throw new AppError(
        'This purchase request has already been reviewed',
        400,
        'PURCHASE_REQUEST_ALREADY_REVIEWED',
      );
    }

    const issuedCard = await this.cardService.issueCardPlanToOwner({
      ownerId: purchaseRequest.userId,
      cardPlanId: purchaseRequest.cardPlanId,
    });

    return this.purchaseRequestRepository.approvePurchaseRequest({
      purchaseRequestId,
      reviewedById: reviewerId,
      issuedCardId: issuedCard.id,
    });
  }

  async rejectPurchaseRequest({ purchaseRequestId, reviewerId, rejectionReason }) {
    const purchaseRequest = await this.purchaseRequestRepository.findById(purchaseRequestId);

    if (!purchaseRequest) {
      throw new AppError('Purchase request not found', 404, 'PURCHASE_REQUEST_NOT_FOUND');
    }

    if (purchaseRequest.status !== 'PENDING') {
      throw new AppError(
        'This purchase request has already been reviewed',
        400,
        'PURCHASE_REQUEST_ALREADY_REVIEWED',
      );
    }

    return this.purchaseRequestRepository.rejectPurchaseRequest({
      purchaseRequestId,
      reviewedById: reviewerId,
      rejectionReason,
    });
  }
}

module.exports = { PurchaseRequestService };
