const { createSuccessResponse } = require('../../utils/api-response');
const { sanitizeCard } = require('../../utils/serializers');

async function purchaseCard(req, res) {
  const card = await req.container.cardService.purchaseCard({
    ownerId: req.user.sub,
    payload: req.body,
  });

  res.status(201).json(
    createSuccessResponse({
      message: 'Card purchased successfully',
      data: sanitizeCard(card, {
        includeQrCode: true,
        includeSensitiveReferences: true,
      }),
    }),
  );
}

async function activateCard(req, res) {
  const card = await req.container.cardService.activateCardByActivationCode({
    ownerId: req.user.sub,
    activationCode: req.body.activationCode,
  });

  res.status(200).json(
    createSuccessResponse({
      message: 'Card activated successfully',
      data: sanitizeCard(card, { includeQrCode: true }),
    }),
  );
}

async function activateCardById(req, res) {
  const card = await req.container.cardService.activateOwnedCard({
    ownerId: req.user.sub,
    cardId: req.params.cardId,
  });

  res.status(200).json(
    createSuccessResponse({
      message: 'Card activated successfully',
      data: sanitizeCard(card, { includeQrCode: true }),
    }),
  );
}

async function getMyCard(req, res) {
  const card = await req.container.cardService.getMyCard(req.user.sub);

  res.status(200).json(
    createSuccessResponse({
      message: 'Card fetched successfully',
      data: sanitizeCard(card, { includeQrCode: true }),
    }),
  );
}

async function listMyCards(req, res) {
  const cards = await req.container.cardService.listMyCards(req.user.sub);

  res.status(200).json(
    createSuccessResponse({
      message: 'Cards fetched successfully',
      data: cards.map((card) => sanitizeCard(card, { includeQrCode: true })),
    }),
  );
}

async function listAllCards(req, res) {
  const cards = await req.container.cardService.listAllCards(req.query);

  res.status(200).json(
    createSuccessResponse({
      message: 'Cards fetched successfully',
      data: cards.items.map((card) => sanitizeCard(card)),
      meta: cards.meta,
    }),
  );
}

module.exports = {
  purchaseCard,
  activateCard,
  activateCardById,
  getMyCard,
  listMyCards,
  listAllCards,
};
