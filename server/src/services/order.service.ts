import { prisma } from '../config/db.js';
import { AppError } from '../utils/AppError.js';
import { calcShipping } from '../utils/pricing.js';
import { generateOrderNumber } from '../utils/format.js';
import { invalidateProductCache } from '../utils/cache.js';
import { cartRepository } from '../repositories/cart.repository.js';
import { orderRepository } from '../repositories/order.repository.js';
import { userRepository } from '../repositories/user.repository.js';
import { paymentService } from './payment.service.js';

const STATUS_FLOW = ['PLACED', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'] as const;

const toDTO = (o: NonNullable<Awaited<ReturnType<typeof orderRepository.findForUser>>>) => ({
  id: o.id, orderNumber: o.orderNumber, status: o.status, placedAt: o.placedAt,
  subtotalCents: o.subtotalCents, shippingCents: o.shippingCents, totalCents: o.totalCents, currency: o.currency,
  paymentMethod: o.paymentMethod, paymentStatus: o.paymentStatus, shippingAddress: o.shippingAddress,
  items: o.items.map(({ id, productName, productSlug, productImage, size, colourName, unitPriceCents, quantity }) =>
    ({ id, productName, productSlug, productImage, size, colourName, unitPriceCents, quantity })),
  timeline: STATUS_FLOW.map((s) => {
    const ev = o.events.find((e) => e.status === s);
    return { status: s, done: !!ev, at: ev?.createdAt ?? null };
  }),
});

export const orderService = {
  async place(userId: string, input: { shippingAddress: any; saveAddress?: boolean; paymentMethod: 'card' | 'cod' }) {
    const user = await userRepository.findById(userId);
    if (!user) throw AppError.unauthorized();
    const cart = await cartRepository.getOrCreate(userId);
    if (cart.items.length === 0) throw AppError.badRequest('Your bag is empty.');

    const orderNumber = generateOrderNumber();
    const subtotalCents = cart.items.reduce((n, i) => n + i.variant.product.priceCents * i.quantity, 0);
    const shippingCents = calcShipping(subtotalCents);
    const totalCents = subtotalCents + shippingCents;
    const payment = await paymentService.charge({ amountCents: totalCents, method: input.paymentMethod, orderNumber });

    const order = await prisma.$transaction(async (tx) => {
      for (const item of cart.items) {
        // Atomic guard against overselling
        const res = await tx.variant.updateMany({ where: { id: item.variantId, stock: { gte: item.quantity } }, data: { stock: { decrement: item.quantity } } });
        if (res.count === 0) throw AppError.conflict(`"${item.variant.product.name}" (${item.variant.size}) just sold out. Please update your bag.`);
      }
      const created = await tx.order.create({
        data: {
          orderNumber, userId, email: user.email, subtotalCents, shippingCents, totalCents,
          shippingAddress: input.shippingAddress, paymentMethod: input.paymentMethod, paymentStatus: payment.status,
          items: { create: cart.items.map((i) => ({
            productName: i.variant.product.name, productSlug: i.variant.product.slug, productImage: i.variant.product.images[0] ?? '',
            size: i.variant.size, colourName: i.variant.colour?.name ?? '', unitPriceCents: i.variant.product.priceCents, quantity: i.quantity,
          })) },
          events: { create: { status: 'PLACED', note: 'Order placed' } },
        },
        include: orderRepository.include,
      });
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
      return created;
    });

    if (input.saveAddress) await userRepository.createAddress(userId, { ...input.shippingAddress, isDefault: false });
    await invalidateProductCache(); // stock changed
    return toDTO(order);
  },

  async list(userId: string) { return (await orderRepository.listForUser(userId)).map(toDTO); },

  async get(userId: string, idOrNumber: string) {
    const o = await orderRepository.findForUser(userId, idOrNumber);
    if (!o) throw AppError.notFound('Order not found');
    return toDTO(o);
  },

  async track(orderNumber: string, email: string) {
    const o = await orderRepository.findByNumberAndEmail(orderNumber, email);
    if (!o) throw AppError.notFound('We could not find an order with those details.');
    return toDTO(o);
  },
};
