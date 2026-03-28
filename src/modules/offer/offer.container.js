const { OfferRepository } = require('./offer.repository');
const { OfferService } = require('./offer.service');

function buildOfferContainer() {
  const offerRepository = new OfferRepository();
  const offerService = new OfferService({ offerRepository });

  return {
    offerRepository,
    offerService,
  };
}

module.exports = { buildOfferContainer };
