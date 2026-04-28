const { CardRepository } = require('../card/card.repository');
const { CardService } = require('../card/card.service');
const { PurchaseRequestRepository } = require('./purchase-request.repository');
const { PurchaseRequestService } = require('./purchase-request.service');

function buildPurchaseRequestContainer() {
  const cardRepository = new CardRepository();
  const cardService = new CardService({ cardRepository });
  const purchaseRequestRepository = new PurchaseRequestRepository();
  const purchaseRequestService = new PurchaseRequestService({
    purchaseRequestRepository,
    cardRepository,
    cardService,
  });

  return {
    cardRepository,
    cardService,
    purchaseRequestRepository,
    purchaseRequestService,
  };
}

module.exports = { buildPurchaseRequestContainer };
