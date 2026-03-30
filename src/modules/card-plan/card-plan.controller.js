const { createSuccessResponse } = require('../../utils/api-response');

async function listCardPlans(req, res) {
  const cardPlans = await req.container.cardPlanService.listPublicCardPlans();

  res.status(200).json(
    createSuccessResponse({
      message: 'Card plans fetched successfully',
      data: cardPlans,
    }),
  );
}

async function getCardPlan(req, res) {
  const cardPlan = await req.container.cardPlanService.getPublicCardPlan(req.params.cardPlanId);

  res.status(200).json(
    createSuccessResponse({
      message: 'Card plan fetched successfully',
      data: cardPlan,
    }),
  );
}

async function listAllCardPlans(req, res) {
  const cardPlans = await req.container.cardPlanService.listAllCardPlans();

  res.status(200).json(
    createSuccessResponse({
      message: 'All card plans fetched successfully',
      data: cardPlans,
    }),
  );
}

async function createCardPlan(req, res) {
  const cardPlan = await req.container.cardPlanService.createCardPlan(req.body);

  res.status(201).json(
    createSuccessResponse({
      message: 'Card plan created successfully',
      data: cardPlan,
    }),
  );
}

async function updateCardPlanStatus(req, res) {
  const cardPlan = await req.container.cardPlanService.updateCardPlanStatus({
    cardPlanId: req.params.cardPlanId,
    status: req.body.status,
  });

  res.status(200).json(
    createSuccessResponse({
      message: 'Card plan status updated successfully',
      data: cardPlan,
    }),
  );
}

async function replaceCardPlanOffers(req, res) {
  const cardPlan = await req.container.cardPlanService.replaceCardPlanOffers({
    cardPlanId: req.params.cardPlanId,
    offerIds: req.body.offerIds,
  });

  res.status(200).json(
    createSuccessResponse({
      message: 'Card plan offers updated successfully',
      data: cardPlan,
    }),
  );
}

module.exports = {
  listCardPlans,
  getCardPlan,
  listAllCardPlans,
  createCardPlan,
  updateCardPlanStatus,
  replaceCardPlanOffers,
};
