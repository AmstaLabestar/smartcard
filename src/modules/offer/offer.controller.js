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
  const offers = await req.container.offerService.listVisibleOffers({
    requester: req.user,
    pagination: req.query,
  });

  res.status(200).json(
    createSuccessResponse({
      message: 'Offers fetched successfully',
      data: offers.items,
      meta: offers.meta,
    }),
  );
}

async function listAllOffers(req, res) {
  const offers = await req.container.offerService.listAllOffers(req.query);

  res.status(200).json(
    createSuccessResponse({
      message: 'All offers fetched successfully',
      data: offers.items,
      meta: offers.meta,
    }),
  );
}

async function listMyOffers(req, res) {
  const offers = await req.container.offerService.listMyOffers({
    creatorId: req.user.sub,
    pagination: req.query,
  });

  res.status(200).json(
    createSuccessResponse({
      message: 'Merchant offers fetched successfully',
      data: offers.items,
      meta: offers.meta,
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
  listAllOffers,
  listMyOffers,
  updateOfferStatus,
};
