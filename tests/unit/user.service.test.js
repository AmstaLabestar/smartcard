const assert = require('node:assert/strict');

const { UserService } = require('../../src/modules/user/user.service');
const { AppError } = require('../../src/utils/app-error');

module.exports = {
  name: 'UserService',
  type: 'unit',
  tests: [
    {
      name: 'createMerchant creates a MERCHANT account',
      run: async () => {
        const createUserCalls = [];
        const service = new UserService({
          userRepository: {
            findByEmailOrPhoneNumber: async () => null,
            createUser: async (payload) => {
              createUserCalls.push(payload);
              return { id: 'merchant_1', role: payload.role, email: payload.email };
            },
          },
        });

        const merchant = await service.createMerchant({
          email: 'merchant@example.com',
          password: 'password123',
          firstName: 'Tanga',
          lastName: 'Shop',
        });

        assert.equal(createUserCalls[0].role, 'MERCHANT');
        assert.ok(createUserCalls[0].passwordHash);
        assert.notEqual(createUserCalls[0].passwordHash, 'password123');
        assert.equal(merchant.role, 'MERCHANT');
      },
    },
    {
      name: 'createMerchant rejects duplicate contact details',
      run: async () => {
        const service = new UserService({
          userRepository: {
            findByEmailOrPhoneNumber: async () => ({ id: 'existing_user' }),
          },
        });

        await assert.rejects(
          () =>
            service.createMerchant({
              email: 'merchant@example.com',
              password: 'password123',
            }),
          (error) => {
            assert.ok(error instanceof AppError);
            assert.equal(error.code, 'USER_ALREADY_EXISTS');
            return true;
          },
        );
      },
    },
  ],
};
