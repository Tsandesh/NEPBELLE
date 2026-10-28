import { prisma } from '../config/db.js';

export const userRepository = {
  findByEmail: (email: string) => prisma.user.findUnique({ where: { email } }),
  findById: (id: string) => prisma.user.findUnique({ where: { id } }),
  create: (data: { email: string; passwordHash: string; firstName: string; lastName: string }) =>
    prisma.user.create({ data }),
  update: (id: string, data: { firstName?: string; lastName?: string; phone?: string }) =>
    prisma.user.update({ where: { id }, data }),
  addresses: (userId: string) =>
    prisma.address.findMany({ where: { userId }, orderBy: [{ isDefault: 'desc' }, { id: 'asc' }] }),
  createAddress: async (userId: string, data: any) => {
    if (data.isDefault) await prisma.address.updateMany({ where: { userId }, data: { isDefault: false } });
    return prisma.address.create({ data: { ...data, userId } });
  },
  deleteAddress: (userId: string, id: string) => prisma.address.deleteMany({ where: { id, userId } }),
};
