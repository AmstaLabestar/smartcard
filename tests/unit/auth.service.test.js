const assert = require('node:assert/strict');
const bcrypt = require('bcrypt');

const { AuthService } = require('../../src/modules/auth/auth.service');
const { AppError } = require('../../src/utils/app-error');

module.exports = {
  name: 'AuthService',
  type: 'unit',
  tests: [
    {
      name: 'register always creates a public user with USER role',
      run: async () => {
        const createdUsers = [];
        const service = new AuthService({
          authRepository: {
            findByEmailOrPhoneNumber: async () => null,
            createUser: async (payload) => {
              createdUsers.push(payload);
              return {
                id: 'user_1',
                email: payload.email,
                phoneNumber: payload.phoneNumber,
                firstName: payload.firstName,
                lastName: payload.lastName,
                role: payload.role,
              };
            },
            toPublicUser: (user) => user,
          },
        });

        const result = await service.register({
          email: 'merchant@example.com',
          password: 'password123',
          firstName: 'Maya',
          lastName: 'Test',
          role: 'MERCHANT',
        });

        assert.equal(createdUsers[0].role, 'USER');
        assert.equal(result.user.role, 'USER');
      },
    },
    {
      name: 'login rejects disabled accounts',
      run: async () => {
        const service = new AuthService({
          authRepository: {
            findByEmailOrPhoneNumber: async () => ({
              id: 'user_1',
              email: 'user@example.com',
              passwordHash: 'hash',
              role: 'USER',
              status: 'DISABLED',
            }),
          },
        });

        await assert.rejects(
          () =>
            service.login({
              email: 'user@example.com',
              password: 'password123',
            }),
          (error) => {
            assert.ok(error instanceof AppError);
            assert.equal(error.code, 'ACCOUNT_DISABLED');
            return true;
          },
        );
      },
    },
    {
      name: 'forgot password sends an email for USER accounts',
      run: async () => {
        let createdToken = null;
        let deletedUserId = null;
        let emailedPayload = null;
        const service = new AuthService({
          authRepository: {
            findByEmail: async () => ({
              id: 'user_1',
              email: 'user@example.com',
              firstName: 'Maya',
              role: 'USER',
            }),
            deletePasswordResetTokensByUserId: async (userId) => {
              deletedUserId = userId;
            },
            createPasswordResetToken: async (payload) => {
              createdToken = payload;
            },
          },
          passwordResetEmailService: {
            isConfigured: () => true,
            sendPasswordResetEmail: async (payload) => {
              emailedPayload = payload;
            },
          },
        });

        const result = await service.requestPasswordReset({
          email: ' user@example.com ',
        });

        assert.deepEqual(result, { acknowledged: true });
        assert.equal(deletedUserId, 'user_1');
        assert.equal(createdToken.userId, 'user_1');
        assert.ok(createdToken.tokenHash);
        assert.ok(createdToken.expiresAt instanceof Date);
        assert.equal(emailedPayload.email, 'user@example.com');
        assert.equal(emailedPayload.firstName, 'Maya');
        assert.ok(emailedPayload.token);
      },
    },
    {
      name: 'forgot password stays generic for unknown emails',
      run: async () => {
        let emailSent = false;
        const service = new AuthService({
          authRepository: {
            findByEmail: async () => null,
          },
          passwordResetEmailService: {
            isConfigured: () => true,
            sendPasswordResetEmail: async () => {
              emailSent = true;
            },
          },
        });

        const result = await service.requestPasswordReset({
          email: 'nobody@example.com',
        });

        assert.deepEqual(result, { acknowledged: true });
        assert.equal(emailSent, false);
      },
    },
    {
      name: 'forgot password rejects when email service is unavailable',
      run: async () => {
        const service = new AuthService({
          authRepository: {
            findByEmail: async () => null,
          },
          passwordResetEmailService: {
            isConfigured: () => false,
          },
        });

        await assert.rejects(
          () => service.requestPasswordReset({ email: 'user@example.com' }),
          (error) => {
            assert.ok(error instanceof AppError);
            assert.equal(error.code, 'EMAIL_NOT_CONFIGURED');
            return true;
          },
        );
      },
    },
    {
      name: 'reset password consumes a valid token',
      run: async () => {
        let resetPayload = null;
        const service = new AuthService({
          authRepository: {
            findActivePasswordResetToken: async () => ({
              id: 'token_1',
              userId: 'user_1',
              user: {
                id: 'user_1',
                role: 'MERCHANT',
              },
            }),
            resetPasswordWithToken: async (payload) => {
              resetPayload = payload;
              return {
                id: 'user_1',
              };
            },
          },
          passwordResetEmailService: {
            isConfigured: () => true,
          },
        });

        const result = await service.resetPassword({
          token: 'reset-token-1234567890reset-token-1234567890',
          newPassword: 'NewPassword123!',
        });

        assert.deepEqual(result, { acknowledged: true });
        assert.equal(resetPayload.tokenId, 'token_1');
        assert.equal(resetPayload.userId, 'user_1');
        assert.ok(await bcrypt.compare('NewPassword123!', resetPayload.passwordHash));
      },
    },
    {
      name: 'reset password rejects invalid tokens',
      run: async () => {
        const service = new AuthService({
          authRepository: {
            findActivePasswordResetToken: async () => null,
          },
          passwordResetEmailService: {
            isConfigured: () => true,
          },
        });

        await assert.rejects(
          () =>
            service.resetPassword({
              token: 'reset-token-1234567890reset-token-1234567890',
              newPassword: 'NewPassword123!',
            }),
          (error) => {
            assert.ok(error instanceof AppError);
            assert.equal(error.code, 'INVALID_PASSWORD_RESET_TOKEN');
            return true;
          },
        );
      },
    },
  ],
};
