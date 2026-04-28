const assert = require('node:assert/strict');

const { PurchaseRequestService } = require('../../src/modules/purchase-request/purchase-request.service');
const { AppError } = require('../../src/utils/app-error');

module.exports = {
  name: 'PurchaseRequestService',
  type: 'unit',
  tests: [
    {
      name: 'createPurchaseRequest creates a pending request for an active plan',
      run: async () => {
        let createdPayload = null;
        const service = new PurchaseRequestService({
          purchaseRequestRepository: {
            findPendingRequestByUserAndPlan: async () => null,
            createPurchaseRequest: async (payload) => {
              createdPayload = payload;
              return {
                id: 'request_1',
                userId: payload.userId,
                cardPlanId: payload.cardPlanId,
                status: 'PENDING',
                note: payload.note,
              };
            },
          },
          cardRepository: {
            findOwnedCardByPlan: async () => null,
            findActiveCardPlanById: async () => ({ id: 'plan_1', status: 'ACTIVE' }),
          },
          cardService: {},
        });

        const result = await service.createPurchaseRequest({
          userId: 'user_1',
          payload: {
            cardPlanId: 'plan_1',
            note: 'Paiement cash en boutique',
          },
        });

        assert.equal(result.status, 'PENDING');
        assert.deepEqual(createdPayload, {
          userId: 'user_1',
          cardPlanId: 'plan_1',
          note: 'Paiement cash en boutique',
        });
      },
    },
    {
      name: 'createPurchaseRequest rejects duplicate pending requests',
      run: async () => {
        const service = new PurchaseRequestService({
          purchaseRequestRepository: {
            findPendingRequestByUserAndPlan: async () => ({ id: 'request_1' }),
          },
          cardRepository: {
            findOwnedCardByPlan: async () => null,
            findActiveCardPlanById: async () => ({ id: 'plan_1', status: 'ACTIVE' }),
          },
          cardService: {},
        });

        await assert.rejects(
          () =>
            service.createPurchaseRequest({
              userId: 'user_1',
              payload: { cardPlanId: 'plan_1' },
            }),
          (error) => {
            assert.ok(error instanceof AppError);
            assert.equal(error.code, 'PURCHASE_REQUEST_ALREADY_PENDING');
            return true;
          },
        );
      },
    },
    {
      name: 'approvePurchaseRequest issues the card and marks the request approved',
      run: async () => {
        let approvedPayload = null;
        let issuedPayload = null;
        const service = new PurchaseRequestService({
          purchaseRequestRepository: {
            findById: async () => ({
              id: 'request_1',
              userId: 'user_1',
              cardPlanId: 'plan_1',
              status: 'PENDING',
            }),
            approvePurchaseRequest: async (payload) => {
              approvedPayload = payload;
              return {
                id: 'request_1',
                status: 'APPROVED',
                issuedCard: { id: payload.issuedCardId },
              };
            },
          },
          cardRepository: {},
          cardService: {
            issueCardPlanToOwner: async (payload) => {
              issuedPayload = payload;
              return { id: 'card_1', status: 'ACTIVE' };
            },
          },
        });

        const result = await service.approvePurchaseRequest({
          purchaseRequestId: 'request_1',
          reviewerId: 'admin_1',
        });

        assert.equal(result.status, 'APPROVED');
        assert.deepEqual(issuedPayload, {
          ownerId: 'user_1',
          cardPlanId: 'plan_1',
        });
        assert.deepEqual(approvedPayload, {
          purchaseRequestId: 'request_1',
          reviewedById: 'admin_1',
          issuedCardId: 'card_1',
        });
      },
    },
    {
      name: 'rejectPurchaseRequest marks the request rejected',
      run: async () => {
        let rejectedPayload = null;
        const service = new PurchaseRequestService({
          purchaseRequestRepository: {
            findById: async () => ({
              id: 'request_1',
              userId: 'user_1',
              cardPlanId: 'plan_1',
              status: 'PENDING',
            }),
            rejectPurchaseRequest: async (payload) => {
              rejectedPayload = payload;
              return {
                id: 'request_1',
                status: 'REJECTED',
                rejectionReason: payload.rejectionReason,
              };
            },
          },
          cardRepository: {},
          cardService: {},
        });

        const result = await service.rejectPurchaseRequest({
          purchaseRequestId: 'request_1',
          reviewerId: 'admin_1',
          rejectionReason: 'Paiement non confirme',
        });

        assert.equal(result.status, 'REJECTED');
        assert.deepEqual(rejectedPayload, {
          purchaseRequestId: 'request_1',
          reviewedById: 'admin_1',
          rejectionReason: 'Paiement non confirme',
        });
      },
    },
  ],
};
