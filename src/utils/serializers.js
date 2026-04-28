function sanitizeUser(user) {
  if (!user) return null;

  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phoneNumber: user.phoneNumber,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

function sanitizeOffer(offer) {
  if (!offer) return null;

  return {
    id: offer.id,
    title: offer.title,
    description: offer.description,
    status: offer.status,
    discountType: offer.discountType,
    discountValue: offer.discountValue,
    terms: offer.terms,
    createdAt: offer.createdAt,
    updatedAt: offer.updatedAt,
    ...(offer.creator && { creator: sanitizeUser(offer.creator) }),
  };
}

function sanitizeCardPlan(cardPlan) {
  if (!cardPlan) return null;

  return {
    id: cardPlan.id,
    name: cardPlan.name,
    slug: cardPlan.slug,
    description: cardPlan.description,
    marketingHighlights: cardPlan.marketingHighlights,
    price: cardPlan.price,
    status: cardPlan.status,
    offers: (cardPlan.offerLinks || []).map((link) => sanitizeOffer(link.offer)),
    createdAt: cardPlan.createdAt,
    updatedAt: cardPlan.updatedAt,
  };
}

function sanitizeCard(card, options = {}) {
  if (!card) return null;

  const { includeQrCode = false, includeSensitiveReferences = false } = options;
  const eligibleOffers = (card.offerAccesses || []).map((link) => sanitizeOffer(link.offer));
  const fallbackOffers = (card.cardPlan?.offerLinks || []).map((link) => sanitizeOffer(link.offer));
  const cardPlanSummary = card.cardPlan || card.planNameSnapshot || card.planPriceSnapshot
    ? {
        id: card.cardPlan?.id || card.cardPlanId || null,
        name: card.planNameSnapshot || card.cardPlan?.name || card.title,
        slug: card.cardPlan?.slug || null,
        description: card.planDescriptionSnapshot || card.cardPlan?.description || card.description,
        marketingHighlights:
          card.planHighlightsSnapshot || card.cardPlan?.marketingHighlights || null,
        price: card.planPriceSnapshot || card.cardPlan?.price || card.price,
        status: card.cardPlan?.status || null,
        offers: eligibleOffers.length > 0 ? eligibleOffers : fallbackOffers,
        createdAt: card.cardPlan?.createdAt || null,
        updatedAt: card.cardPlan?.updatedAt || null,
      }
    : null;

  return {
    id: card.id,
    title: card.title,
    description: card.description,
    status: card.status,
    cardNumber: card.cardNumber,
    ...(includeQrCode && { qrCode: card.qrCode }),
    ...(includeSensitiveReferences && {
      activationCode: card.activationCode,
      purchaseReference: card.purchaseReference,
    }),
    price: card.price,
    activatedAt: card.activatedAt,
    createdAt: card.createdAt,
    updatedAt: card.updatedAt,
    eligibleOffers,
    ...(cardPlanSummary && { cardPlan: cardPlanSummary }),
    ...(card.owner && { owner: sanitizeUser(card.owner) }),
  };
}

function sanitizeTransaction(transaction) {
  if (!transaction) return null;

  return {
    id: transaction.id,
    reference: transaction.reference,
    originalAmount: transaction.originalAmount,
    discountAmount: transaction.discountAmount,
    amount: transaction.amount,
    status: transaction.status,
    createdAt: transaction.createdAt,
    updatedAt: transaction.updatedAt,
    ...(transaction.user && { user: sanitizeUser(transaction.user) }),
    ...(transaction.card && { card: sanitizeCard(transaction.card) }),
    ...(transaction.offer && { offer: sanitizeOffer(transaction.offer) }),
  };
}

function sanitizePurchaseRequest(purchaseRequest) {
  if (!purchaseRequest) return null;

  return {
    id: purchaseRequest.id,
    status: purchaseRequest.status,
    note: purchaseRequest.note,
    rejectionReason: purchaseRequest.rejectionReason,
    reviewedAt: purchaseRequest.reviewedAt,
    createdAt: purchaseRequest.createdAt,
    updatedAt: purchaseRequest.updatedAt,
    ...(purchaseRequest.user && { user: sanitizeUser(purchaseRequest.user) }),
    ...(purchaseRequest.reviewedBy && { reviewedBy: sanitizeUser(purchaseRequest.reviewedBy) }),
    ...(purchaseRequest.cardPlan && {
      cardPlan: {
        id: purchaseRequest.cardPlan.id,
        name: purchaseRequest.cardPlan.name,
        slug: purchaseRequest.cardPlan.slug,
        description: purchaseRequest.cardPlan.description,
        marketingHighlights: purchaseRequest.cardPlan.marketingHighlights,
        price: purchaseRequest.cardPlan.price,
        status: purchaseRequest.cardPlan.status,
        createdAt: purchaseRequest.cardPlan.createdAt,
        updatedAt: purchaseRequest.cardPlan.updatedAt,
      },
    }),
    ...(purchaseRequest.issuedCard && { issuedCard: sanitizeCard(purchaseRequest.issuedCard) }),
  };
}

module.exports = {
  sanitizeUser,
  sanitizeCardPlan,
  sanitizeCard,
  sanitizeOffer,
  sanitizeTransaction,
  sanitizePurchaseRequest,
};
