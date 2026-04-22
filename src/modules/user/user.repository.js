const prisma = require('../../config/prisma');
const { getPaginationParams } = require('../../utils/pagination');

class UserRepository {
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

  async findUsersByRole({ role, pagination }) {
    const where = role ? { role } : undefined;
    const { page, limit, skip } = getPaginationParams(pagination);
    const select = {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phoneNumber: true,
      role: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    };

    const [items, total] = await prisma.$transaction([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        select,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.user.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  async createUser(data) {
    return prisma.user.create({
      data,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phoneNumber: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findById(userId) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phoneNumber: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async countUsersByRoleAndStatus({ role, status }) {
    return prisma.user.count({
      where: {
        role,
        status,
      },
    });
  }

  async updateUserStatusById(userId, status) {
    return prisma.user.update({
      where: { id: userId },
      data: { status },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phoneNumber: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
}

module.exports = { UserRepository };
