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

  toPublicUser(user) {
    const safeUser = { ...user };
    delete safeUser.passwordHash;
    return safeUser;
  }
}

module.exports = { AuthRepository };
