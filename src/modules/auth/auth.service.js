const bcrypt = require('bcrypt');
const nodeCrypto = require('node:crypto');

const { env } = require('../../config/env');
const { generateAccessToken } = require('../../utils/tokens');
const { AppError } = require('../../utils/app-error');

function normalizeContactPayload(payload) {
  return {
    ...payload,
    email: typeof payload.email === 'string' ? payload.email.trim() : payload.email,
    phoneNumber: typeof payload.phoneNumber === 'string' ? payload.phoneNumber.trim() : payload.phoneNumber,
  };
}

class AuthService {
  constructor({ authRepository, passwordResetEmailService }) {
    this.authRepository = authRepository;
    this.passwordResetEmailService = passwordResetEmailService;
  }

  async register(payload) {
    const normalizedPayload = normalizeContactPayload(payload);

    const existingUser = await this.authRepository.findByEmailOrPhoneNumber({
      email: normalizedPayload.email,
      phoneNumber: normalizedPayload.phoneNumber,
    });

    if (existingUser) {
      const error = new Error('Email or phone number already in use');
      error.statusCode = 409;
      throw error;
    }

    const passwordHash = await bcrypt.hash(payload.password, 10);

    const user = await this.authRepository.createUser({
      email: normalizedPayload.email,
      phoneNumber: normalizedPayload.phoneNumber,
      passwordHash,
      firstName: normalizedPayload.firstName,
      lastName: normalizedPayload.lastName,
      role: 'USER',
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
    const normalizedPayload = normalizeContactPayload(payload);

    const user = await this.authRepository.findByEmailOrPhoneNumber({
      email: normalizedPayload.email,
      phoneNumber: normalizedPayload.phoneNumber,
    });

    if (!user) {
      const error = new Error('Invalid credentials');
      error.statusCode = 401;
      throw error;
    }

    if (user.status === 'DISABLED') {
      throw new AppError('Account disabled', 403, 'ACCOUNT_DISABLED');
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

  async requestPasswordReset({ email }) {
    if (!this.passwordResetEmailService?.isConfigured()) {
      throw new AppError(
        'Password reset is unavailable right now',
        503,
        'EMAIL_NOT_CONFIGURED',
      );
    }

    const normalizedEmail = email.trim();
    const user = await this.authRepository.findByEmail(normalizedEmail);

    if (!user || !user.email || !['USER', 'MERCHANT'].includes(user.role)) {
      return {
        acknowledged: true,
      };
    }

    const rawToken = nodeCrypto.randomBytes(32).toString('hex');
    const tokenHash = nodeCrypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(
      Date.now() + env.PASSWORD_RESET_TOKEN_TTL_MINUTES * 60 * 1000,
    );

    await this.authRepository.deletePasswordResetTokensByUserId(user.id);
    await this.authRepository.createPasswordResetToken({
      userId: user.id,
      tokenHash,
      expiresAt,
    });

    await this.passwordResetEmailService.sendPasswordResetEmail({
      email: user.email,
      firstName: user.firstName,
      token: rawToken,
      expiresInMinutes: env.PASSWORD_RESET_TOKEN_TTL_MINUTES,
    });

    return {
      acknowledged: true,
    };
  }

  async resetPassword({ token, newPassword }) {
    const tokenHash = nodeCrypto.createHash('sha256').update(token).digest('hex');
    const passwordResetToken = await this.authRepository.findActivePasswordResetToken(tokenHash);

    if (
      !passwordResetToken
      || !passwordResetToken.user
      || !['USER', 'MERCHANT'].includes(passwordResetToken.user.role)
    ) {
      throw new AppError(
        'Reset token is invalid or expired',
        400,
        'INVALID_PASSWORD_RESET_TOKEN',
      );
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await this.authRepository.resetPasswordWithToken({
      tokenId: passwordResetToken.id,
      userId: passwordResetToken.userId,
      passwordHash,
    });

    return {
      acknowledged: true,
    };
  }
}

module.exports = { AuthService };
