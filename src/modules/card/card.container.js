const { CardRepository } = require('./card.repository');
const { CardService } = require('./card.service');

function buildCardContainer() {
  const cardRepository = new CardRepository();
  const cardService = new CardService({ cardRepository });

  return {
    cardRepository,
    cardService,
  };
}

module.exports = { buildCardContainer };
