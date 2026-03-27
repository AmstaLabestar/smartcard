const prisma = require('../../config/prisma');

class UserRepository {
  async findUsersByRole(role) {
    return prisma.user.findMany({
      where: role ? { role } : undefined,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phoneNumber: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}

module.exports = { UserRepository };
