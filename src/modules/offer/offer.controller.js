const { createSuccessResponse } = require('../../utils/api-response');

async function createOffer(req, res) {
  const offer = await req.container.offerService.createOffer({
    creatorId: req.user.sub,
    payload: req.body,
  });

  res.status(201).json(
    createSuccessResponse({
      message: 'Offer created successfully',
      data: offer,
    }),
  );
}

async function listOffers(req, res) {
  const offers = await req.container.offerService.listActiveOffers();

  res.status(200).json(
    createSuccessResponse({
      message: 'Offers fetched successfully',
      data: offers,
    }),
  );
}

async function listMyOffers(req, res) {
  const offers = await req.container.offerService.listMyOffers(req.user.sub);

  res.status(200).json(
    createSuccessResponse({
      message: 'Merchant offers fetched successfully',
      data: offers,
    }),
  );
}

async function updateOfferStatus(req, res) {
  const offer = await req.container.offerService.updateOfferStatus({
    offerId: req.params.offerId,
    requester: req.user,
    status: req.body.status,
  });

  res.status(200).json(
    createSuccessResponse({
      message: 'Offer status updated successfully',
      data: offer,
    }),
  );
}

module.exports = {
  createOffer,
  listOffers,
  listMyOffers,
  updateOfferStatus,
};
