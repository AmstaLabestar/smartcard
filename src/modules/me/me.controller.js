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
      message: 'Current user card fetched successfully',
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

module.exports = {
  getMe,
  getMyCard,
  getMyTransactions,
};
