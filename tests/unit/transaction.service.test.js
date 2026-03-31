const assert = require('node:assert/strict');

const { TransactionService } = require('../../src/modules/transaction/transaction.service');
const { AppError } = require('../../src/utils/app-error');

module.exports = {
  name: 'TransactionService',
  type: 'unit',
  tests: [
    {
      name: 'previewScan only returns active offers allowed for the merchant',
      run: async () => {
        const service = new TransactionService({
          transactionRepository: {
            findCardByQrCode: async () => ({
              id: 'card_1',
              status: 'ACTIVE',
              ownerId: 'user_1',
              cardPlanId: 'plan_1',
              owner: { id: 'user_1', role: 'USER', firstName: 'Nadia', lastName: 'Client' },
              offerAccesses: [
                { offer: { id: 'offer_1', title: 'A', status: 'ACTIVE', creatorId: 'merchant_1' } },
                { offer: { id: 'offer_2', title: 'B', status: 'INACTIVE', creatorId: 'merchant_1' } },
                { offer: { id: 'offer_3', title: 'C', status: 'ACTIVE', creatorId: 'merchant_2' } },
              ],
            }),
          },
        });

        const result = await service.previewScan({
          requester: { sub: 'merchant_1', role: 'MERCHANT' },
          payload: { qrCode: 'qr_123' },
        });

        assert.equal(result.customer.firstName, 'Nadia');
        assert.equal(result.eligibleOffers.length, 1);
        assert.equal(result.eligibleOffers[0].id, 'offer_1');
      },
    },
    {
      name: 'scanAndCreateTransaction rejects offers not allowed for the scanned card',
      run: async () => {
        const service = new TransactionService({
          transactionRepository: {
            findCardByQrCode: async () => ({
              id: 'card_1',
              status: 'ACTIVE',
              ownerId: 'user_1',
              cardPlanId: 'plan_1',
              owner: { id: 'user_1', role: 'USER' },
              offerAccesses: [{ offer: { id: 'offer_1', status: 'ACTIVE', creatorId: 'merchant_1' } }],
            }),
            findOfferById: async () => ({
              id: 'offer_2',
              status: 'ACTIVE',
              creatorId: 'merchant_1',
              discountType: 'PERCENTAGE',
              discountValue: 10,
            }),
          },
        });

        await assert.rejects(
          () => service.scanAndCreateTransaction({
            requester: { sub: 'merchant_1', role: 'MERCHANT' },
            payload: { qrCode: 'qr_123', offerId: 'offer_2', originalAmount: 100 },
          }),
          (error) => {
            assert.ok(error instanceof AppError);
            assert.equal(error.code, 'OFFER_NOT_ALLOWED_FOR_CARD');
            return true;
          },
        );
      },
    },
    {
      name: 'scanAndCreateTransaction computes the discounted amount and creates the transaction',
      run: async () => {
        let createTransactionPayload;
        const service = new TransactionService({
          transactionRepository: {
            findCardByQrCode: async () => ({
              id: 'card_1',
              status: 'ACTIVE',
              ownerId: 'user_1',
              cardPlanId: 'plan_1',
              owner: { id: 'user_1', role: 'USER' },
              offerAccesses: [{ offer: { id: 'offer_1', status: 'ACTIVE', creatorId: 'merchant_1' } }],
            }),
            findOfferById: async () => ({
              id: 'offer_1',
              title: 'Reduction 20%',
              status: 'ACTIVE',
              creatorId: 'merchant_1',
              discountType: 'PERCENTAGE',
              discountValue: 20,
            }),
            findRecentDuplicateTransaction: async () => null,
            createTransaction: async (payload) => {
              createTransactionPayload = payload;
              return { id: 'tx_1', reference: payload.reference, ...payload };
            },
          },
        });

        const transaction = await service.scanAndCreateTransaction({
          requester: { sub: 'merchant_1', role: 'MERCHANT' },
          payload: { qrCode: 'qr_123', offerId: 'offer_1', originalAmount: 200 },
        });

        assert.equal(createTransactionPayload.discountAmount, 40);
        assert.equal(createTransactionPayload.amount, 160);
        assert.equal(transaction.amount, 160);
        assert.equal(transaction.userId, 'user_1');
      },
    },
  ],
};
