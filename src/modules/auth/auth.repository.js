const prisma = require('../../config/prisma');

class AuthRepository {
  async findByEmail(email) {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  async findByEmailOrPhoneNumber({ email, phoneNumber }) {
    return prisma.user.findFirst({
      where: {
        OR: [
          ...(email ? [{ email }] : []),
          ...(phoneNumber ? [{ phoneNumber }] : []),
        ],
      },
    });
  }

  async findById(id) {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  async createUser(data) {
    const user = await prisma.user.create({
      data,
    });

    return this.toPublicUser(user);
  }

  async updatePasswordById(id, passwordHash) {
    const user = await prisma.user.update({
      where: { id },
      data: { passwordHash },
    });

    return this.toPublicUser(user);
  }

  async deletePasswordResetTokensByUserId(userId) {
    return prisma.passwordResetToken.deleteMany({
      where: { userId },
    });
  }

  async createPasswordResetToken({ userId, tokenHash, expiresAt }) {
    return prisma.passwordResetToken.create({
      data: {
        userId,
        tokenHash,
        expiresAt,
      },
    });
  }

  async findActivePasswordResetToken(tokenHash) {
    return prisma.passwordResetToken.findFirst({
      where: {
        tokenHash,
        usedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        user: true,
      },
    });
  }

  async resetPasswordWithToken({ tokenId, userId, passwordHash }) {
    const [user] = await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { passwordHash },
      }),
      prisma.passwordResetToken.update({
        where: { id: tokenId },
        data: { usedAt: new Date() },
      }),
      prisma.passwordResetToken.deleteMany({
        where: {
          userId,
          id: {
            not: tokenId,
          },
        },
      }),
    ]);

    return this.toPublicUser(user);
  }

  toPublicUser(user) {
    const safeUser = { ...user };
    delete safeUser.passwordHash;
    return safeUser;
  }
}

module.exports = { AuthRepository };
