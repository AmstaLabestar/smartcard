const bcrypt = require('bcrypt');

const { AppError } = require('../../utils/app-error');
const { createPaginationMeta } = require('../../utils/pagination');

class UserService {
  constructor({ userRepository }) {
    this.userRepository = userRepository;
  }

  async listUsers(pagination) {
    const result = await this.userRepository.findUsersByRole({ pagination });
    return {
      items: result.items,
      meta: createPaginationMeta(result),
    };
  }

  async listMerchants(pagination) {
    const result = await this.userRepository.findUsersByRole({ role: 'MERCHANT', pagination });
    return {
      items: result.items,
      meta: createPaginationMeta(result),
    };
  }

  async createMerchant(payload) {
    const existingUser = await this.userRepository.findByEmailOrPhoneNumber({
      email: payload.email,
      phoneNumber: payload.phoneNumber,
    });

    if (existingUser) {
      throw new AppError('Email or phone number already in use', 409, 'USER_ALREADY_EXISTS');
    }

    const passwordHash = await bcrypt.hash(payload.password, 10);

    return this.userRepository.createUser({
      email: payload.email,
      phoneNumber: payload.phoneNumber,
      passwordHash,
      firstName: payload.firstName,
      lastName: payload.lastName,
      role: 'MERCHANT',
    });
  }

  async updateUserStatus({ requesterId, targetUserId, status }) {
    const user = await this.userRepository.findById(targetUserId);

    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    if (requesterId === targetUserId && status === 'DISABLED') {
      throw new AppError('You cannot disable your own account', 400, 'SELF_DISABLE_FORBIDDEN');
    }

    if (user.role === 'ADMIN' && user.status === 'ACTIVE' && status === 'DISABLED') {
      const activeAdminCount = await this.userRepository.countUsersByRoleAndStatus({
        role: 'ADMIN',
        status: 'ACTIVE',
      });

      if (activeAdminCount <= 1) {
        throw new AppError('You cannot disable the last active admin', 400, 'LAST_ADMIN_DISABLE_FORBIDDEN');
      }
    }

    return this.userRepository.updateUserStatusById(targetUserId, status);
  }

  async resetUserPassword({ targetUserId, newPassword }) {
    const user = await this.userRepository.findById(targetUserId);

    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    return this.userRepository.updatePasswordById(targetUserId, passwordHash);
  }
}

module.exports = { UserService };
