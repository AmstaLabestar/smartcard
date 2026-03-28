const { generateTransactionReference } = require('../../utils/identifiers');

class TransactionService {
  constructor({ transactionRepository }) {
    this.transactionRepository = transactionRepository;
  }

  async scanAndCreateTransaction({ requester, payload }) {
    const card = await this.transactionRepository.findCardByQrCode(payload.qrCode);

    if (!card) {
      const error = new Error('Card not found');
      error.statusCode = 404;
      throw error;
    }

    if (card.status !== 'ACTIVE') {
      const error = new Error('Card is not active');
      error.statusCode = 400;
      throw error;
    }

    const offer = await this.transactionRepository.findOfferById(payload.offerId);

    if (!offer) {
      const error = new Error('Offer not found');
      error.statusCode = 404;
      throw error;
    }

    if (offer.status !== 'ACTIVE') {
      const error = new Error('Offer is not active');
      error.statusCode = 400;
      throw error;
    }

    const isAdmin = requester.role === 'ADMIN';
    const isOwnerMerchant = offer.creatorId === requester.sub;

    if (!isAdmin && !isOwnerMerchant) {
      const error = new Error('Forbidden');
      error.statusCode = 403;
      throw error;
    }

    const originalAmount = Number(payload.originalAmount);
    let discountAmount = 0;

    if (offer.discountType === 'PERCENTAGE') {
      discountAmount = (originalAmount * Number(offer.discountValue)) / 100;
    } else {
      discountAmount = Number(offer.discountValue);
    }

    discountAmount = Math.min(discountAmount, originalAmount);
    const finalAmount = Math.max(originalAmount - discountAmount, 0);

    return this.transactionRepository.createTransaction({
      originalAmount,
      discountAmount,
      amount: finalAmount,
      status: 'COMPLETED',
      userId: card.ownerId,
      cardId: card.id,
      offerId: offer.id,
      reference: generateTransactionReference(),
    });
  }

  async listMyTransactions(userId) {
    return this.transactionRepository.findTransactionsByUserId(userId);
  }

  async listMerchantTransactions(requester) {
    if (requester.role === 'ADMIN') {
      const error = new Error('Admin merchant listing is not implemented yet');
      error.statusCode = 400;
      throw error;
    }

    return this.transactionRepository.findTransactionsByMerchantId(requester.sub);
  }
}

module.exports = { TransactionService };
