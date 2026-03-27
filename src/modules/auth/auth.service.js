const bcrypt = require('bcrypt');

const { generateAccessToken } = require('../../utils/tokens');

class AuthService {
  constructor({ authRepository }) {
    this.authRepository = authRepository;
  }

  async register(payload) {
    const existingUser = await this.authRepository.findByEmailOrPhoneNumber({
      email: payload.email,
      phoneNumber: payload.phoneNumber,
    });

    if (existingUser) {
      const error = new Error('Email or phone number already in use');
      error.statusCode = 409;
      throw error;
    }

    const passwordHash = await bcrypt.hash(payload.password, 10);

    const user = await this.authRepository.createUser({
      email: payload.email,
      phoneNumber: payload.phoneNumber,
      passwordHash,
      firstName: payload.firstName,
      lastName: payload.lastName,
      role: payload.role || 'USER',
    });

    return {
      user,
      accessToken: generateAccessToken({
        sub: user.id,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
      }),
    };
  }

  async login(payload) {
    const user = await this.authRepository.findByEmailOrPhoneNumber({
      email: payload.email,
      phoneNumber: payload.phoneNumber,
    });

    if (!user) {
      const error = new Error('Invalid credentials');
      error.statusCode = 401;
      throw error;
    }

    const isPasswordValid = await bcrypt.compare(payload.password, user.passwordHash);

    if (!isPasswordValid) {
      const error = new Error('Invalid credentials');
      error.statusCode = 401;
      throw error;
    }

    return {
      user: this.authRepository.toPublicUser(user),
      accessToken: generateAccessToken({
        sub: user.id,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
      }),
    };
  }

  async getProfile(userId) {
    const user = await this.authRepository.findById(userId);

    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    return this.authRepository.toPublicUser(user);
  }
}

module.exports = { AuthService };
