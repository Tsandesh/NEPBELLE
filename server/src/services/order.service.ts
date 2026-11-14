import { env } from '../config/env.js';
import { redis } from '../config/redis.js';
import { AppError } from '../utils/AppError.js';
import { invalidateProductCache } from '../utils/cache.js';
import { generateOrderNumber } from '../utils/format.js';
import { calcShipping } from '../utils/pricing.js';
import { cartRepository } from '../repositories/cart.repository.js';
import { orderRepository } from '../repositories/order.repository.js';
import { userRepository } from '../repositories/user.repository.js';
import { notificationService } from './notification.service.js';
import { orderWorkflowService } from './orderWorkflow.service.js';
import { uploadService } from './upload.service.js';

const FLOW = ['PLACED', 'CONFIRMED', 'PACKED', 'OUT_FOR_DELIVERY', 'DELIVERED'] as const;
const refKey = (userId: string) => `checkout-ref:${userId}`;

type Order = NonNullable<Awaited<ReturnType<typeof orderRepository.findForUser>>>;
const toDTO = (o: Order) => ({
  id: o.id, orderNumber: o.orderNumber, status: o.status, placedAt: o.placedAt,
  subtotalCents: o.subtotalCents, shippingCents: o.shippingCents, totalCents: o.totalCents, currency: o.currency,
  paymentMethod: o.paymentMethod, paymentStatus: o.paymentStatus, payidReceiptNumber: o.payidReceiptNumber,
  paymentNote: o.paymentStatus === 'REJECTED' ? o.paymentNote : null, hasProof: !!o.paymentProofFile,
  courier: o.courier, trackingNumber: o.trackingNumber, cancelReason: o.cancelReason, shippingAddress: o.shippingAddress,
  items: o.items.map(({ id, productName, productSlug, productImage, size, colourName, unitPriceCents, quantity }) =>
    ({ id, productName, productSlug, productImage, size, colourName, unitPriceCents, quantity })),
  canResubmitProof: o.paymentMethod === 'PAYID' && o.paymentStatus === 'REJECTED' && o.status === 'PLACED',
  canRequestExchange: o.status === 'DELIVERED' && !!o.deliveredAt && Date.now() - o.deliveredAt.getTime() <= env.EXCHANGE_WINDOW_DAYS * 86_400_000,
  timeline: FLOW.map((s) => {
    const ev = o.events.find((e) => e.kind === 'STATUS' && e.status === s);
    return { status: s, done: !!ev, at: ev?.createdAt ?? null };
  }),
});

export interface PlaceInput {
  shippingAddress: { fullName: string; line1: string; line2?: string; city: string; state: string; postcode: string; country: string; phone: string };
  saveAddress?: boolean; paymentMethod: 'COD' | 'PAYID'; reference?: string; payidReceiptNumber?: string; expectedTotalCents: number;
}

export const orderService = {
  /** A unique order reference shown BEFORE the customer pays, so they can put it in the PayID description. */
  async reference(userId: string) {
    await redis.set(refKey(userId), generateOrderNumber(), 'EX', 7200, 'NX');
    return (await redis.get(refKey(userId)))!;
  },

  async place(userId: string, input: PlaceInput, file?: Express.Multer.File) {
    const user = await userRepository.findById(userId);
    if (!user) throw AppError.unauthorized();
    const cart = await cartRepository.getOrCreate(userId);
    if (!cart.items.length) throw AppError.badRequest('Your bag is empty.');

    // Price from the database. The client's number is only used to detect that prices changed.
    const lines = cart.items.map((i) => ({
      variantId: i.variantId, productName: i.variant.product.name, productSlug: i.variant.product.slug,
      productImage: i.variant.product.images[0] ?? '', size: i.variant.size, colourName: i.variant.colour.name,
      unitPriceCents: i.variant.product.priceCents, quantity: i.quantity,
    }));
    const subtotalCents = lines.reduce((n, l) => n + l.unitPriceCents * l.quantity, 0);
    const shippingCents = calcShipping(subtotalCents);
    const totalCents = subtotalCents + shippingCents;
    if (input.expectedTotalCents !== totalCents) throw AppError.conflict('Prices or shipping changed since you last looked. Please review your bag and try again.');
    if (input.paymentMethod === 'COD' && env.COD_MAX_TOTAL_CENTS > 0 && totalCents > env.COD_MAX_TOTAL_CENTS)
      throw new AppError(422, 'COD_LIMIT', `Cash on delivery is available for orders up to AU$${(env.COD_MAX_TOTAL_CENTS / 100).toFixed(2)}. Please pay by PayID.`);

    let orderNumber = generateOrderNumber();
    let proofFile: string | null = null;
    if (input.paymentMethod === 'PAYID') {
      if (!file) throw new AppError(422, 'PROOF_REQUIRED', 'Please upload a screenshot of your PayID payment.');
      if (!input.reference || (await redis.get(refKey(userId))) !== input.reference)
        throw new AppError(422, 'BAD_REFERENCE', 'Your payment reference expired. Please reload the payment page and pay again with the new reference.');
      orderNumber = input.reference;
      proofFile = await uploadService.savePrivate(file); // also verifies it really is an image
    }

    const a = input.shippingAddress;
    let order;
    try {
      order = await orderRepository.createOrder({
        orderNumber, userId, email: user.email, customerName: a.fullName, phone: a.phone,
        subtotalCents, shippingCents, totalCents, shippingAddress: a, paymentMethod: input.paymentMethod,
        receipt: input.payidReceiptNumber, proofFile, lines,
      });
    } catch (err) {
      await uploadService.deletePrivate(proofFile); // don't leave an orphaned screenshot
      throw err;
    }
    if (input.paymentMethod === 'PAYID') await redis.del(refKey(userId));
    await invalidateProductCache(); // stock changed
    if (input.saveAddress) await userRepository.createAddress(userId, { ...a, isDefault: false }).catch(() => undefined);

    await notificationService.queueFor(await orderRepository.findForMail(order.id), ['ADMIN_NEW_ORDER', 'CUSTOMER_ORDER_RECEIVED']);
    return this.get(userId, order.id);
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

  /** After you reject a PayID payment, the customer can upload a new screenshot. */
  async resubmitProof(userId: string, id: string, file: Express.Multer.File | undefined, receipt?: string) {
    const order = await orderRepository.findForUser(userId, id);
    if (!order) throw AppError.notFound('Order not found');
    if (!(order.paymentMethod === 'PAYID' && order.paymentStatus === 'REJECTED' && order.status === 'PLACED')) throw AppError.conflict('A new screenshot can’t be uploaded for this order.');
    if (!file) throw new AppError(422, 'PROOF_REQUIRED', 'Please choose a screenshot to upload.');

    const newFile = await uploadService.savePrivate(file);
    const ok = await orderRepository.applyChange({
      orderId: order.id, fromPayment: 'REJECTED', fromStatus: 'PLACED',
      data: { paymentStatus: 'PROOF_SUBMITTED', paymentProofFile: newFile, paymentProofAt: new Date(), paymentNote: null, ...(receipt ? { payidReceiptNumber: receipt } : {}) },
      events: [{ kind: 'PAYMENT', status: 'PLACED', note: 'Customer uploaded a new payment screenshot', actor: 'customer' }],
    });
    if (!ok) { await uploadService.deletePrivate(newFile); throw AppError.conflict('This order was just updated. Please refresh.'); }
    await uploadService.deletePrivate(order.paymentProofFile);
    await notificationService.queueFor(await orderRepository.findForMail(order.id), ['ADMIN_PROOF_RESUBMITTED']);
    return this.get(userId, order.id);
  },

  async requestExchange(userId: string, id: string, reason: string) {
    const order = await orderRepository.findForUser(userId, id);
    if (!order) throw AppError.notFound('Order not found');
    if (order.status !== 'DELIVERED' || !order.deliveredAt) throw AppError.conflict('Exchanges can only be requested after delivery.');
    if (Date.now() - order.deliveredAt.getTime() > env.EXCHANGE_WINDOW_DAYS * 86_400_000) throw AppError.conflict(`The ${env.EXCHANGE_WINDOW_DAYS}-day exchange window has passed.`);
    await orderWorkflowService.changeStatus(order.id, { status: 'EXCHANGE_REQUESTED', note: reason }, 'customer');
    return this.get(userId, order.id);
  },
};