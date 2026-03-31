const { z } = require('zod');

const { env } = require('../../config/env');

const MAX_ALLOWED_AMOUNT = env.MAX_TRANSACTION_AMOUNT;

const scanPreviewSchema = z.object({
  qrCode: z
    .string({ required_error: 'Le QR code est requis.' })
    .trim()
    .min(10, 'Le QR code scanne est trop court ou invalide.')
    .max(120, 'Le QR code scanne est trop long.'),
});

const scanTransactionSchema = z.object({
  qrCode: z
    .string({ required_error: 'Le QR code est requis.' })
    .trim()
    .min(10, 'Le QR code scanne est trop court ou invalide.')
    .max(120, 'Le QR code scanne est trop long.'),
  offerId: z.string({ required_error: 'L offre selectionnee est requise.' }).uuid('L identifiant de l offre est invalide.'),
  originalAmount: z.coerce
    .number({ invalid_type_error: 'Le montant doit etre un nombre valide.' })
    .positive('Le montant doit etre superieur a zero.')
    .max(MAX_ALLOWED_AMOUNT, `Le montant depasse la limite autorisee de ${MAX_ALLOWED_AMOUNT}.`),
});

module.exports = {
  scanPreviewSchema,
  scanTransactionSchema,
};
