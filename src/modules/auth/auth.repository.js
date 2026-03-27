const prisma = require('../../config/prisma');

class AuthRepository {
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

  async createUser(data) {
    const user = await prisma.user.create({
      data,
    });

    return this.toPublicUser(user);
  }

  toPublicUser(user) {
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }
}

module.exports = { AuthRepository };
