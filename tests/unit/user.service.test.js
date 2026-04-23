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
    {
      name: 'updateUserStatus disables a merchant account',
      run: async () => {
        const service = new UserService({
          userRepository: {
            findById: async () => ({ id: 'merchant_1', role: 'MERCHANT', status: 'ACTIVE' }),
            updateUserStatusById: async (userId, status) => ({ id: userId, status }),
          },
        });

        const result = await service.updateUserStatus({
          requesterId: 'admin_1',
          targetUserId: 'merchant_1',
          status: 'DISABLED',
        });

        assert.equal(result.status, 'DISABLED');
      },
    },
    {
      name: 'updateUserStatus rejects self disable for admins',
      run: async () => {
        const service = new UserService({
          userRepository: {
            findById: async () => ({ id: 'admin_1', role: 'ADMIN', status: 'ACTIVE' }),
          },
        });

        await assert.rejects(
          () =>
            service.updateUserStatus({
              requesterId: 'admin_1',
              targetUserId: 'admin_1',
              status: 'DISABLED',
            }),
          (error) => {
            assert.ok(error instanceof AppError);
            assert.equal(error.code, 'SELF_DISABLE_FORBIDDEN');
            return true;
          },
        );
      },
    },
    {
      name: 'updateUserStatus rejects disabling the last active admin',
      run: async () => {
        const service = new UserService({
          userRepository: {
            findById: async () => ({ id: 'admin_2', role: 'ADMIN', status: 'ACTIVE' }),
            countUsersByRoleAndStatus: async () => 1,
          },
        });

        await assert.rejects(
          () =>
            service.updateUserStatus({
              requesterId: 'admin_1',
              targetUserId: 'admin_2',
              status: 'DISABLED',
            }),
          (error) => {
            assert.ok(error instanceof AppError);
            assert.equal(error.code, 'LAST_ADMIN_DISABLE_FORBIDDEN');
            return true;
          },
        );
      },
    },
    {
      name: 'resetUserPassword updates the target user password',
      run: async () => {
        const updates = [];
        const service = new UserService({
          userRepository: {
            findById: async () => ({ id: 'user_1', role: 'USER', status: 'ACTIVE' }),
            updatePasswordById: async (userId, passwordHash) => {
              updates.push({ userId, passwordHash });
              return { id: userId };
            },
          },
        });

        await service.resetUserPassword({
          targetUserId: 'user_1',
          newPassword: 'newPassword123',
        });

        assert.equal(updates[0].userId, 'user_1');
        assert.ok(updates[0].passwordHash);
        assert.notEqual(updates[0].passwordHash, 'newPassword123');
      },
    },
  ],
};
