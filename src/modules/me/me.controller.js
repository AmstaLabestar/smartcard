const { createSuccessResponse } = require('../../utils/api-response');
const { sanitizeCard, sanitizeTransaction, sanitizeUser } = require('../../utils/serializers');

async function getMe(req, res) {
  const user = await req.container.meService.getCurrentUser(req.user.sub);

  res.status(200).json(
    createSuccessResponse({
      message: 'Current user fetched successfully',
      data: sanitizeUser(user),
    }),
  );
}

async function getMyCard(req, res) {
  const card = await req.container.meService.getCurrentUserCard(req.user.sub);

  res.status(200).json(
    createSuccessResponse({
      message: 'Current user active card fetched successfully',
      data: sanitizeCard(card, { includeQrCode: true }),
    }),
  );
}

async function getMyCards(req, res) {
  const cards = await req.container.meService.getCurrentUserCards(req.user.sub);

  res.status(200).json(
    createSuccessResponse({
      message: 'Current user cards fetched successfully',
      data: cards.map((card) => sanitizeCard(card, { includeQrCode: true })),
    }),
  );
}

async function getMyActiveCard(req, res) {
  const card = await req.container.meService.getCurrentUserActiveCard(req.user.sub);

  res.status(200).json(
    createSuccessResponse({
      message: 'Current user active card fetched successfully',
      data: sanitizeCard(card, { includeQrCode: true }),
    }),
  );
}

async function getMyTransactions(req, res) {
  const transactions = await req.container.meService.getCurrentUserTransactions(req.user.sub);

  res.status(200).json(
    createSuccessResponse({
      message: 'Current user transactions fetched successfully',
      data: transactions.map(sanitizeTransaction),
    }),
  );
}

async function changeMyPassword(req, res) {
  await req.container.meService.changeCurrentUserPassword({
    userId: req.user.sub,
    currentPassword: req.body.currentPassword,
    newPassword: req.body.newPassword,
  });

  res.status(200).json(
    createSuccessResponse({
      message: 'Password updated successfully',
      data: null,
    }),
  );
}

module.exports = {
  getMe,
  getMyCard,
  getMyCards,
  getMyActiveCard,
  getMyTransactions,
  changeMyPassword,
};
