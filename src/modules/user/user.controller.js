const { createSuccessResponse } = require('../../utils/api-response');

async function listUsers(req, res) {
  const users = await req.container.userService.listUsers();

  res.status(200).json(
    createSuccessResponse({
      message: 'Users fetched successfully',
      data: users,
    }),
  );
}

async function listMerchants(req, res) {
  const merchants = await req.container.userService.listMerchants();

  res.status(200).json(
    createSuccessResponse({
      message: 'Merchants fetched successfully',
      data: merchants,
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
