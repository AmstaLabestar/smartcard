const bcrypt = require('bcrypt');

const { AppError } = require('../../utils/app-error');

class UserService {
  constructor({ userRepository }) {
    this.userRepository = userRepository;
  }

  async listUsers() {
    return this.userRepository.findUsersByRole();
  }

  async listMerchants() {
    return this.userRepository.findUsersByRole('MERCHANT');
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
