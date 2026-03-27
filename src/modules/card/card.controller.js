const { createSuccessResponse } = require('../../utils/api-response');

async function purchaseCard(req, res) {
  const card = await req.container.cardService.purchaseCard({
    ownerId: req.user.sub,
    payload: req.body,
  });

  res.status(201).json(
    createSuccessResponse({
      message: 'Card purchased successfully',
      data: card,
    }),
  );
}

async function activateCard(req, res) {
  const card = await req.container.cardService.activateCard({
    ownerId: req.user.sub,
    activationCode: req.body.activationCode,
  });

  res.status(200).json(
    createSuccessResponse({
      message: 'Card activated successfully',
      data: card,
    }),
  );
}

async function getMyCard(req, res) {
  const card = await req.container.cardService.getMyCard(req.user.sub);

  res.status(200).json(
    createSuccessResponse({
      message: 'Card fetched successfully',
      data: card,
    }),
  );
}

async function listAllCards(req, res) {
  const cards = await req.container.cardService.listAllCards();

  res.status(200).json(
    createSuccessResponse({
      message: 'Cards fetched successfully',
      data: cards,
    }),
  );
}

module.exports = {
  purchaseCard,
  activateCard,
  getMyCard,
  listAllCards,
};
