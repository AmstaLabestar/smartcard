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
          },
        });

        const card = await service.purchaseCard({
          ownerId: 'user_1',
          payload: { cardPlanId: 'plan_1' },
        });

        assert.equal(card.ownerId, 'user_1');
        assert.equal(card.cardPlanId, 'plan_1');
        assert.equal(card.planNameSnapshot, 'Carte Premium');
        assert.deepEqual(createCardCalls[0].offerAccessOfferIds, ['offer_1', 'offer_2']);
        assert.equal(createCardCalls[0].status, 'INACTIVE');
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
