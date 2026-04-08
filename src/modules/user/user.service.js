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
}

module.exports = { UserService };
