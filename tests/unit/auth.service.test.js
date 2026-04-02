const assert = require('node:assert/strict');

const { AuthService } = require('../../src/modules/auth/auth.service');

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
  ],
};
