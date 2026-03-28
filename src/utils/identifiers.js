const { v4: uuidv4 } = require('uuid');

function generateCardNumber() {
  return `CARD-${uuidv4().replace(/-/g, '').slice(0, 12).toUpperCase()}`;
}

function generateQrCodeValue() {
  return `QR-${uuidv4()}`;
}

function generateActivationCode() {
  return `ACT-${uuidv4().replace(/-/g, '').slice(0, 8).toUpperCase()}`;
}

function generatePurchaseReference() {
  return `PUR-${uuidv4().replace(/-/g, '').slice(0, 10).toUpperCase()}`;
}

function generateTransactionReference() {
  return `TXN-${uuidv4().replace(/-/g, '').slice(0, 12).toUpperCase()}`;
}

module.exports = {
  generateActivationCode,
  generateCardNumber,
  generatePurchaseReference,
  generateQrCodeValue,
  generateTransactionReference,
};
