import { prisma } from '../config/db.js';

const include = { items: true, events: { orderBy: { createdAt: 'asc' as const } } };

export const orderRepository = {
  listForUser: (userId: string) => prisma.order.findMany({ where: { userId }, orderBy: { placedAt: 'desc' }, include }),
  findForUser: (userId: string, id: string) => prisma.order.findFirst({ where: { userId, OR: [{ id }, { orderNumber: id }] }, include }),
  findByNumberAndEmail: (orderNumber: string, email: string) =>
    prisma.order.findFirst({ where: { orderNumber, email }, include }),
  include,
};
