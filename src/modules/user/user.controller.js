const { createSuccessResponse } = require('../../utils/api-response');

async function listUsers(req, res) {
  const users = await req.container.userService.listUsers(req.query);

  res.status(200).json(
    createSuccessResponse({
      message: 'Users fetched successfully',
      data: users.items,
      meta: users.meta,
    }),
  );
}

async function listMerchants(req, res) {
  const merchants = await req.container.userService.listMerchants(req.query);

  res.status(200).json(
    createSuccessResponse({
      message: 'Merchants fetched successfully',
      data: merchants.items,
      meta: merchants.meta,
    }),
  );
}

async function createMerchant(req, res) {
  const merchant = await req.container.userService.createMerchant(req.body);

  res.status(201).json(
    createSuccessResponse({
      message: 'Merchant created successfully',
      data: merchant,
    }),
  );
}

module.exports = {
  listUsers,
  listMerchants,
  createMerchant,
};
