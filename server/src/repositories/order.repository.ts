import type { OrderStatus, PaymentStatus, Prisma } from '@prisma/client';
import { prisma } from '../config/db.js';
import { AppError } from '../utils/AppError.js';

const include = { items: true, events: { orderBy: [{ createdAt: 'asc' as const }, { id: 'asc' as const }] } };

export interface CreateOrderInput {
  orderNumber: string; userId: string; email: string; customerName: string; phone: string;
  subtotalCents: number; shippingCents: number; totalCents: number;
  shippingAddress: Prisma.InputJsonValue; paymentMethod: 'COD' | 'PAYID';
  receipt?: string; proofFile?: string | null;
  lines: { variantId: string; productName: string; productSlug: string; productImage: string; size: string; colourName: string; unitPriceCents: number; quantity: number }[];
}
export interface EventInput { kind: 'STATUS' | 'PAYMENT' | 'NOTE'; status: OrderStatus; note?: string; actor: string }

export const orderRepository = {
  include,
  listForUser: (userId: string) => prisma.order.findMany({ where: { userId }, orderBy: { placedAt: 'desc' }, include }),
  findForUser: (userId: string, idOrNumber: string) =>
    prisma.order.findFirst({ where: { userId, OR: [{ id: idOrNumber }, { orderNumber: idOrNumber }] }, include }),
  findByNumberAndEmail: (orderNumber: string, email: string) => prisma.order.findFirst({ where: { orderNumber, email }, include }),
  findForMail: (id: string) => prisma.order.findUnique({ where: { id }, include: { items: true } }),

  /** Reserve stock, create the order, clear the cart: all or nothing. */
  createOrder: (i: CreateOrderInput) =>
    prisma.$transaction(async (tx) => {
      for (const l of i.lines) {
        const r = await tx.variant.updateMany({ where: { id: l.variantId, stock: { gte: l.quantity } }, data: { stock: { decrement: l.quantity } } });
        if (r.count === 0) throw AppError.conflict(`“${l.productName}” (${l.size}) is no longer available in that quantity. Please update your bag.`);
      }
      const order = await tx.order.create({
        data: {
          orderNumber: i.orderNumber, userId: i.userId, email: i.email, customerName: i.customerName, phone: i.phone,
          status: 'PLACED', subtotalCents: i.subtotalCents, shippingCents: i.shippingCents, totalCents: i.totalCents, currency: 'AUD',
          shippingAddress: i.shippingAddress, paymentMethod: i.paymentMethod,
          paymentStatus: i.paymentMethod === 'PAYID' ? 'PROOF_SUBMITTED' : 'UNPAID',
          payidReceiptNumber: i.receipt ?? null, paymentProofFile: i.proofFile ?? null, paymentProofAt: i.proofFile ? new Date() : null,
          items: { create: i.lines },
          events: { create: { kind: 'STATUS', status: 'PLACED', actor: 'customer', note: i.paymentMethod === 'PAYID' ? 'Order placed, PayID screenshot uploaded' : 'Order placed, cash on delivery' } },
        },
      });
      await tx.cartItem.deleteMany({ where: { cart: { userId: i.userId } } });
      return order;
    }),

  /** Apply a change only if the order is still in the state the caller saw. Returns false if someone else changed it first. */
  applyChange: (a: {
    orderId: string; fromStatus?: OrderStatus; fromPayment?: PaymentStatus;
    data: Prisma.OrderUpdateManyMutationInput; events: EventInput[]; restock?: boolean;
  }) =>
    prisma.$transaction(async (tx) => {
      const r = await tx.order.updateMany({
        where: { id: a.orderId, ...(a.fromStatus ? { status: a.fromStatus } : {}), ...(a.fromPayment ? { paymentStatus: a.fromPayment } : {}) },
        data: a.data,
      });
      if (r.count === 0) return false;
      if (a.restock) {
        const items = await tx.orderItem.findMany({ where: { orderId: a.orderId } });
        for (const it of items) {
          if (it.variantId) await tx.variant.updateMany({ where: { id: it.variantId }, data: { stock: { increment: it.quantity } } });
        }
      }
      const base = Date.now();
      for (const [n, e] of a.events.entries()) await tx.orderEvent.create({ data: { orderId: a.orderId, ...e, createdAt: new Date(base + n) } });
      return true;
    }),
};