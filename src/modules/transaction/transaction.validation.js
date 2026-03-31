const { z } = require('zod');

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
    .max(100000, 'Le montant depasse la limite autorisee.'),
});

module.exports = {
  scanPreviewSchema,
  scanTransactionSchema,
};
