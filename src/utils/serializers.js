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

function sanitizeCard(card, options = {}) {
  if (!card) return null;

  const { includeQrCode = false, includeSensitiveReferences = false } = options;

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
    ...(card.owner && { owner: sanitizeUser(card.owner) }),
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

module.exports = {
  sanitizeUser,
  sanitizeCard,
  sanitizeOffer,
  sanitizeTransaction,
};
