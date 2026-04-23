const assert = require('node:assert/strict');
const bcrypt = require('bcrypt');

const { MeService } = require('../../src/modules/me/me.service');
const { AppError } = require('../../src/utils/app-error');

module.exports = {
  name: 'MeService',
  type: 'unit',
  tests: [
    {
      name: 'changeCurrentUserPassword updates the password when the current password matches',
      run: async () => {
        const currentHash = await bcrypt.hash('oldPassword123', 10);
        const updates = [];
        const service = new MeService({
          authRepository: {
            findById: async () => ({ id: 'user_1', passwordHash: currentHash }),
            updatePasswordById: async (userId, passwordHash) => {
              updates.push({ userId, passwordHash });
              return { id: userId };
            },
          },
          cardRepository: {},
          transactionRepository: {},
        });

        await service.changeCurrentUserPassword({
          userId: 'user_1',
          currentPassword: 'oldPassword123',
          newPassword: 'newPassword123',
        });

        assert.equal(updates[0].userId, 'user_1');
        assert.notEqual(updates[0].passwordHash, currentHash);
      },
    },
    {
      name: 'changeCurrentUserPassword rejects an invalid current password',
      run: async () => {
        const currentHash = await bcrypt.hash('oldPassword123', 10);
        const service = new MeService({
          authRepository: {
            findById: async () => ({ id: 'user_1', passwordHash: currentHash }),
          },
          cardRepository: {},
          transactionRepository: {},
        });

        await assert.rejects(
          () =>
            service.changeCurrentUserPassword({
              userId: 'user_1',
              currentPassword: 'wrongPassword123',
              newPassword: 'newPassword123',
            }),
          (error) => {
            assert.ok(error instanceof AppError);
            assert.equal(error.code, 'INVALID_CURRENT_PASSWORD');
            return true;
          },
        );
      },
    },
  ],
};
