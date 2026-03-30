const { generateTransactionReference } = require('../../utils/identifiers');
const { AppError } = require('../../utils/app-error');
const { logInfo, logWarn } = require('../../utils/logger');

const MAX_ALLOWED_AMOUNT = 100000;
const ABNORMAL_AMOUNT_THRESHOLD = 5000;
const DUPLICATE_SCAN_WINDOW_MS = 60000;

class TransactionService {
  constructor({ transactionRepository }) {
    this.transactionRepository = transactionRepository;
  }

  async scanAndCreateTransaction({ requester, payload }) {
    const card = await this.transactionRepository.findCardByQrCode(payload.qrCode);

    if (!card) {
      throw new AppError('Card not found', 404, 'CARD_NOT_FOUND');
    }

    if (card.status !== 'ACTIVE') {
      throw new AppError('Card is not active', 400, 'CARD_NOT_ACTIVE');
    }

    if (!card.owner || card.owner.role !== 'USER') {
      throw new AppError('Card owner is invalid', 400, 'INVALID_CARD_OWNER');
    }

    if (!card.cardPlanId || !card.cardPlan) {
      throw new AppError('Card plan is not configured for this card', 400, 'CARD_PLAN_NOT_CONFIGURED');
    }

    const offer = await this.transactionRepository.findOfferById(payload.offerId);

    if (!offer) {
      throw new AppError('Offer not found', 404, 'OFFER_NOT_FOUND');
    }

    if (offer.status !== 'ACTIVE') {
      throw new AppError('Offer is not active', 400, 'OFFER_NOT_ACTIVE');
    }

    const isAdmin = requester.role === 'ADMIN';
    const isOwnerMerchant = offer.creatorId === requester.sub;

    if (!isAdmin && !isOwnerMerchant) {
      throw new AppError('Forbidden', 403, 'FORBIDDEN');
    }

    const allowedOfferIds = new Set((card.cardPlan.offerLinks || []).map((link) => link.offerId));

    if (!allowedOfferIds.has(offer.id)) {
      throw new AppError('This offer is not included in the customer card plan', 403, 'OFFER_NOT_ALLOWED_FOR_CARD_PLAN');
    }

    const originalAmount = Number(payload.originalAmount);

    if (originalAmount <= 0) {
      throw new AppError('Amount must be greater than zero', 400, 'INVALID_AMOUNT');
    }

    if (originalAmount > MAX_ALLOWED_AMOUNT) {
      logWarn('transaction_abnormal_amount', {
        merchantId: requester.sub,
        cardId: card.id,
        offerId: offer.id,
        originalAmount,
      });

      throw new AppError('Amount exceeds the allowed limit', 400, 'AMOUNT_LIMIT_EXCEEDED');
    }

    if (originalAmount >= ABNORMAL_AMOUNT_THRESHOLD) {
      logWarn('transaction_high_amount_warning', {
        merchantId: requester.sub,
        cardId: card.id,
        offerId: offer.id,
        originalAmount,
      });
    }

    const duplicateWindowStart = new Date(Date.now() - DUPLICATE_SCAN_WINDOW_MS);
    const duplicateTransaction = await this.transactionRepository.findRecentDuplicateTransaction({
      cardId: card.id,
      offerId: offer.id,
      originalAmount,
      duplicateWindowStart,
    });

    if (duplicateTransaction) {
      throw new AppError('Duplicate scan detected. Please wait before scanning again.', 409, 'DUPLICATE_SCAN_DETECTED');
    }

    let discountAmount = 0;

    if (offer.discountType === 'PERCENTAGE') {
      discountAmount = (originalAmount * Number(offer.discountValue)) / 100;
    } else {
      discountAmount = Number(offer.discountValue);
    }

    discountAmount = Math.min(discountAmount, originalAmount);
    const finalAmount = Math.max(originalAmount - discountAmount, 0);

    const transaction = await this.transactionRepository.createTransaction({
      originalAmount,
      discountAmount,
      amount: finalAmount,
      status: 'COMPLETED',
      userId: card.ownerId,
      cardId: card.id,
      offerId: offer.id,
      reference: generateTransactionReference(),
    });

    logInfo('transaction_created', {
      userId: card.ownerId,
      merchantId: offer.creatorId,
      offerId: offer.id,
      cardPlanId: card.cardPlanId,
      amount: finalAmount,
      originalAmount,
      discountAmount,
      transactionId: transaction.id,
      reference: transaction.reference,
    });

    return transaction;
  }

  async listMyTransactions(userId) {
    return this.transactionRepository.findTransactionsByUserId(userId);
  }

  async listMerchantTransactions(requester) {
    if (requester.role === 'ADMIN') {
      throw new AppError('Admin merchant listing is not implemented yet', 400, 'ADMIN_LISTING_NOT_IMPLEMENTED');
    }

    return this.transactionRepository.findTransactionsByMerchantId(requester.sub);
  }
}

module.exports = { TransactionService };
