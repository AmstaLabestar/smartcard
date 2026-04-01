const assert = require('node:assert/strict');

const { CardService } = require('../../src/modules/card/card.service');
const { AppError } = require('../../src/utils/app-error');

module.exports = {
  name: 'CardService',
  type: 'unit',
  tests: [
    {
      name: 'purchaseCard creates a card from the chosen plan snapshot',
      run: async () => {
        const createCardCalls = [];
        const activateCardForOwnerCalls = [];
        const service = new CardService({
          cardRepository: {
            findOwnedCardByPlan: async () => null,
            findActiveCardPlanById: async () => ({
              id: 'plan_1',
              name: 'Carte Premium',
              description: 'Acces premium',
              marketingHighlights: 'A, C et D',
              price: 49.99,
              offerLinks: [{ offerId: 'offer_1' }, { offerId: 'offer_2' }],
            }),
            createCard: async (payload) => {
              createCardCalls.push(payload);
              return { id: 'card_1', ...payload };
            },
            activateCardForOwner: async (payload) => {
              activateCardForOwnerCalls.push(payload);
              return { id: payload.cardId, ownerId: payload.ownerId, status: 'ACTIVE' };
            },
          },
        });

        const card = await service.purchaseCard({
          ownerId: 'user_1',
          payload: { cardPlanId: 'plan_1' },
        });

        assert.equal(card.ownerId, 'user_1');
        assert.equal(card.id, 'card_1');
        assert.equal(card.status, 'ACTIVE');
        assert.equal(createCardCalls[0].cardPlanId, 'plan_1');
        assert.equal(createCardCalls[0].planNameSnapshot, 'Carte Premium');
        assert.deepEqual(createCardCalls[0].offerAccessOfferIds, ['offer_1', 'offer_2']);
        assert.equal(createCardCalls[0].status, 'INACTIVE');
        assert.deepEqual(activateCardForOwnerCalls[0], { ownerId: 'user_1', cardId: 'card_1' });
      },
    },
    {
      name: 'purchaseCard rejects an already owned card plan',
      run: async () => {
        const service = new CardService({
          cardRepository: {
            findOwnedCardByPlan: async () => ({ id: 'existing_card' }),
          },
        });

        await assert.rejects(
          () => service.purchaseCard({ ownerId: 'user_1', payload: { cardPlanId: 'plan_1' } }),
          (error) => {
            assert.ok(error instanceof AppError);
            assert.equal(error.code, 'CARD_PLAN_ALREADY_OWNED');
            return true;
          },
        );
      },
    },
    {
      name: 'activateOwnedCard rejects archived cards',
      run: async () => {
        const service = new CardService({
          cardRepository: {
            findCardByIdAndOwnerId: async () => ({ id: 'card_1', status: 'ARCHIVED' }),
          },
        });

        await assert.rejects(
          () => service.activateOwnedCard({ ownerId: 'user_1', cardId: 'card_1' }),
          (error) => {
            assert.ok(error instanceof AppError);
            assert.equal(error.code, 'CARD_ARCHIVED');
            return true;
          },
        );
      },
    },
  ],
};
