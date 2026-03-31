const { generateTransactionReference } = require('../../utils/identifiers');
const { AppError } = require('../../utils/app-error');
const { logInfo, logWarn } = require('../../utils/logger');
const { env } = require('../../config/env');

const MAX_ALLOWED_AMOUNT = env.MAX_TRANSACTION_AMOUNT;
const ABNORMAL_AMOUNT_THRESHOLD = Math.min(5000, MAX_ALLOWED_AMOUNT);
const DUPLICATE_SCAN_WINDOW_MS = 60000;

class TransactionService {
  constructor({ transactionRepository }) {
    this.transactionRepository = transactionRepository;
  }

  getEligibleMerchantOffers({ card, requester }) {
    const isAdmin = requester.role === 'ADMIN';

    return (card.offerAccesses || [])
      .map((link) => link.offer)
      .filter(Boolean)
      .filter((offer) => offer.status === 'ACTIVE')
      .filter((offer) => isAdmin || offer.creatorId === requester.sub);
  }

  ensureCardCanBeUsed(card) {
    if (!card) {
      throw new AppError('Aucune carte correspondante n a ete trouvee pour ce QR code.', 404, 'CARD_NOT_FOUND');
    }

    if (card.status !== 'ACTIVE') {
      throw new AppError('La carte scannee n est pas active. Le client doit activer cette carte avant utilisation.', 400, 'CARD_NOT_ACTIVE');
    }

    if (!card.owner || card.owner.role !== 'USER') {
      throw new AppError('Le proprietaire de cette carte est invalide.', 400, 'INVALID_CARD_OWNER');
    }

    if (!card.cardPlanId) {
      throw new AppError('Cette carte n est rattachee a aucune formule valide.', 400, 'CARD_PLAN_NOT_CONFIGURED');
    }
  }

  async previewScan({ requester, payload }) {
    const card = await this.transactionRepository.findCardByQrCode(payload.qrCode);
    this.ensureCardCanBeUsed(card);

    const eligibleOffers = this.getEligibleMerchantOffers({ card, requester });

    return {
      card,
      customer: card.owner,
      eligibleOffers,
      limits: {
        maxTransactionAmount: MAX_ALLOWED_AMOUNT,
      },
    };
  }

  async scanAndCreateTransaction({ requester, payload }) {
    const card = await this.transactionRepository.findCardByQrCode(payload.qrCode);
    this.ensureCardCanBeUsed(card);

    const offer = await this.transactionRepository.findOfferById(payload.offerId);

    if (!offer) {
      throw new AppError('L offre selectionnee est introuvable.', 404, 'OFFER_NOT_FOUND');
    }

    if (offer.status !== 'ACTIVE') {
      throw new AppError('Cette offre n est pas active pour le moment.', 400, 'OFFER_NOT_ACTIVE');
    }

    const isAdmin = requester.role === 'ADMIN';
    const isOwnerMerchant = offer.creatorId === requester.sub;

    if (!isAdmin && !isOwnerMerchant) {
      throw new AppError('Vous ne pouvez pas appliquer une offre qui n appartient pas a votre commerce.', 403, 'FORBIDDEN');
    }

    const allowedOfferIds = new Set(this.getEligibleMerchantOffers({ card, requester }).map((eligibleOffer) => eligibleOffer.id));

    if (!allowedOfferIds.has(offer.id)) {
      throw new AppError('La carte du client ne donne pas acces a cette reduction.', 403, 'OFFER_NOT_ALLOWED_FOR_CARD');
    }

    const originalAmount = Number(payload.originalAmount);

    if (originalAmount <= 0) {
      throw new AppError('Le montant doit etre superieur a zero.', 400, 'INVALID_AMOUNT');
    }

    if (originalAmount > MAX_ALLOWED_AMOUNT) {
      logWarn('transaction_abnormal_amount', {
        merchantId: requester.sub,
        cardId: card.id,
        offerId: offer.id,
        originalAmount,
        maxAllowedAmount: MAX_ALLOWED_AMOUNT,
      });

      throw new AppError(`Le montant depasse la limite autorisee de ${MAX_ALLOWED_AMOUNT}.`, 400, 'AMOUNT_LIMIT_EXCEEDED');
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
      throw new AppError('Cette carte vient deja d etre scannee pour cette offre. Attendez quelques instants avant de recommencer.', 409, 'DUPLICATE_SCAN_DETECTED');
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
      cardId: card.id,
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
      throw new AppError('La liste des transactions marchand n est pas disponible pour ce role.', 400, 'ADMIN_LISTING_NOT_IMPLEMENTED');
    }

    return this.transactionRepository.findTransactionsByMerchantId(requester.sub);
  }
}

module.exports = { TransactionService };
