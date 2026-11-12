import { Prisma, type OrderStatus, type PaymentMethod, type PaymentStatus } from '@prisma/client';
import { prisma } from '../config/db.js';

export interface AdminOrderFilter { status?: OrderStatus; paymentStatus?: PaymentStatus; method?: PaymentMethod; q?: string; page: number; limit: number }

const where = (f: AdminOrderFilter): Prisma.OrderWhereInput => ({
  ...(f.status ? { status: f.status } : {}),
  ...(f.paymentStatus ? { paymentStatus: f.paymentStatus } : {}),
  ...(f.method ? { paymentMethod: f.method } : {}),
  ...(f.q ? { OR: [
    { orderNumber: { contains: f.q, mode: 'insensitive' } }, { email: { contains: f.q, mode: 'insensitive' } },
    { customerName: { contains: f.q, mode: 'insensitive' } }, { phone: { contains: f.q } },
  ] } : {}),
});

export const adminOrderRepository = {
  async list(f: AdminOrderFilter) {
    const [items, total] = await prisma.$transaction([
      prisma.order.findMany({
        where: where(f), orderBy: { placedAt: 'desc' }, skip: (f.page - 1) * f.limit, take: f.limit,
        select: { id: true, orderNumber: true, placedAt: true, customerName: true, phone: true, email: true, totalCents: true, status: true, paymentMethod: true, paymentStatus: true, _count: { select: { items: true } } },
      }),
      prisma.order.count({ where: where(f) }),
    ]);
    return { items, total };
  },
  findDetail: (id: string) =>
    prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
        events: { orderBy: [{ createdAt: 'asc' }, { id: 'asc' }] },
        notifications: { orderBy: { createdAt: 'desc' }, take: 30, select: { id: true, channel: true, event: true, recipient: true, status: true, attempts: true, lastError: true, createdAt: true, sentAt: true } },
      },
    }),
  sameReceipt: (receipt: string, exceptId: string) =>
    prisma.order.findMany({ where: { payidReceiptNumber: receipt, NOT: { id: exceptId } }, select: { orderNumber: true } }),
  addNote: (orderId: string, status: OrderStatus, note: string, actor: string) =>
    prisma.orderEvent.create({ data: { orderId, kind: 'NOTE', status, note, actor } }),
  async summary() {
    const [byStatus, proofs, refunds, cod, needsAction, revenue] = await Promise.all([
      prisma.order.groupBy({ by: ['status'], _count: { _all: true } }),
      prisma.order.count({ where: { paymentStatus: 'PROOF_SUBMITTED' } }),
      prisma.order.count({ where: { paymentStatus: 'REFUND_DUE' } }),
      prisma.order.count({ where: { paymentMethod: 'COD', paymentStatus: 'UNPAID', status: { in: ['OUT_FOR_DELIVERY', 'DELIVERED'] } } }),
      prisma.order.count({ where: { status: { in: ['PLACED', 'EXCHANGE_REQUESTED'] } } }),
      prisma.order.aggregate({ where: { paymentStatus: 'PAID', status: { not: 'CANCELLED' } }, _sum: { totalCents: true } }),
    ]);
    return { byStatus: Object.fromEntries(byStatus.map((r) => [r.status, r._count._all])), proofsToCheck: proofs, refundsDue: refunds, codToCollect: cod, needsAction, paidRevenueCents: revenue._sum.totalCents ?? 0 };
  },
};