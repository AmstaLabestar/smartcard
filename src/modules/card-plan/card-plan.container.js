const { CardPlanRepository } = require('./card-plan.repository');
const { CardPlanService } = require('./card-plan.service');

function buildCardPlanContainer() {
  const cardPlanRepository = new CardPlanRepository();
  const cardPlanService = new CardPlanService({ cardPlanRepository });

  return {
    cardPlanRepository,
    cardPlanService,
  };
}

module.exports = { buildCardPlanContainer };
