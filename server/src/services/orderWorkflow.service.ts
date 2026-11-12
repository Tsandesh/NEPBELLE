import type { OrderStatus, Prisma } from '@prisma/client';
import { STATUS_LABEL, canTransition } from '../domain/orderWorkflow.js';
import { orderRepository, type EventInput } from '../repositories/order.repository.js';
import { AppError } from '../utils/AppError.js';
import { invalidateProductCache } from '../utils/cache.js';
import { notificationService } from './notification.service.js';
import type { NotifyEvent } from './notification/templates.js';

export interface ChangeStatusInput { status: OrderStatus; note?: string; courier?: string; trackingNumber?: string; cashCollected?: boolean }
export type PaymentAction = 'VERIFY' | 'REJECT' | 'MARK_COLLECTED' | 'MARK_REFUNDED';

const load = async (orderId: string) => {
  const o = await orderRepository.findForMail(orderId);
  if (!o) throw AppError.notFound('Order not found');
  return o;
};
const stale = () => AppError.conflict('This order was just changed by someone else. Refresh and try again.');

export const orderWorkflowService = {
  async changeStatus(orderId: string, input: ChangeStatusInput, actor: string) {
    const order = await load(orderId);
    const to = input.status;
    const note = input.note?.trim() || undefined;

    if (!canTransition(order.status, to))
      throw AppError.conflict(`An order can’t move from “${STATUS_LABEL[order.status]}” to “${STATUS_LABEL[to]}”.`);
    if (to === 'CONFIRMED' && order.paymentMethod === 'PAYID' && order.paymentStatus !== 'PAID')
      throw AppError.conflict('Verify the PayID payment before confirming this order.');
    if ((to === 'CANCELLED' || to === 'EXCHANGE_REQUESTED') && (!note || note.length < 3)) throw AppError.badRequest('Please give a reason.');
    if (order.status === 'EXCHANGE_REQUESTED' && to === 'DELIVERED' && !note) throw AppError.badRequest('Please say why the exchange was declined.');
    const cashDue = to === 'DELIVERED' && order.status === 'OUT_FOR_DELIVERY' && order.paymentMethod === 'COD' && order.paymentStatus === 'UNPAID';
    if (cashDue && !input.cashCollected) throw AppError.badRequest('Confirm that you collected the cash before marking this order delivered.');

    const data: Prisma.OrderUpdateManyMutationInput = { status: to };
    const events: EventInput[] = [{ kind: 'STATUS', status: to, note, actor }];
    if (to === 'CONFIRMED') data.confirmedAt = new Date();
    if (to === 'OUT_FOR_DELIVERY') { data.courier = input.courier?.trim() || null; data.trackingNumber = input.trackingNumber?.trim() || null; }
    if (to === 'DELIVERED' && order.status === 'OUT_FOR_DELIVERY') data.deliveredAt = new Date();
    if (to === 'CANCELLED') {
      data.cancelReason = note;
      if (order.paymentMethod === 'PAYID' && (order.paymentStatus === 'PAID' || order.paymentStatus === 'PROOF_SUBMITTED')) {
        data.paymentStatus = 'REFUND_DUE';
        events.push({ kind: 'PAYMENT', status: to, note: 'Refund due to customer', actor });
      }
    }
    if (cashDue) { data.paymentStatus = 'PAID'; events.push({ kind: 'PAYMENT', status: to, note: 'Cash collected on delivery', actor }); }

    const applied = await orderRepository.applyChange({ orderId, fromStatus: order.status, data, events, restock: to === 'CANCELLED' });
    if (!applied) throw stale();
    if (to === 'CANCELLED') await invalidateProductCache(); // stock came back

    const notify: NotifyEvent[] = [];
    if (to === 'CONFIRMED') notify.push('CUSTOMER_CONFIRMED');
    if (to === 'OUT_FOR_DELIVERY') notify.push('CUSTOMER_OUT_FOR_DELIVERY');
    if (to === 'DELIVERED') notify.push(order.status === 'EXCHANGE_REQUESTED' ? 'CUSTOMER_EXCHANGE_DECLINED' : 'CUSTOMER_DELIVERED');
    if (to === 'CANCELLED') notify.push('CUSTOMER_CANCELLED');
    if (to === 'EXCHANGE_REQUESTED') notify.push('CUSTOMER_EXCHANGE_REQUESTED', ...(actor === 'customer' ? (['ADMIN_EXCHANGE_REQUEST'] as const) : []));
    if (to === 'EXCHANGED') notify.push('CUSTOMER_EXCHANGED');
    await notificationService.queueFor(await orderRepository.findForMail(orderId), notify, { reason: note });
  },

  async paymentAction(orderId: string, input: { action: PaymentAction; note?: string }, actor: string) {
    const order = await load(orderId);
    const note = input.note?.trim() || undefined;

    switch (input.action) {
      case 'VERIFY': {
        if (order.paymentMethod !== 'PAYID' || order.paymentStatus !== 'PROOF_SUBMITTED') throw AppError.conflict('There is no PayID payment waiting to be verified.');
        const confirm = order.status === 'PLACED'; // verifying also confirms a new order
        const events: EventInput[] = [{ kind: 'PAYMENT', status: confirm ? 'CONFIRMED' : order.status, note: 'PayID payment verified', actor }];
        if (confirm) events.push({ kind: 'STATUS', status: 'CONFIRMED', note: 'Confirmed after payment verification', actor });
        const ok = await orderRepository.applyChange({
          orderId, fromPayment: 'PROOF_SUBMITTED', fromStatus: order.status,
          data: { paymentStatus: 'PAID', paymentNote: null, ...(confirm ? { status: 'CONFIRMED', confirmedAt: new Date() } : {}) }, events,
        });
        if (!ok) throw stale();
        if (confirm) await notificationService.queueFor(await orderRepository.findForMail(orderId), ['CUSTOMER_CONFIRMED']);
        return;
      }
      case 'REJECT': {
        if (!note || note.length < 3) throw AppError.badRequest('Please say why the payment was rejected.');
        if (order.paymentMethod !== 'PAYID' || order.paymentStatus !== 'PROOF_SUBMITTED' || order.status !== 'PLACED') throw AppError.conflict('Only a new PayID payment can be rejected.');
        const ok = await orderRepository.applyChange({
          orderId, fromPayment: 'PROOF_SUBMITTED', fromStatus: 'PLACED', data: { paymentStatus: 'REJECTED', paymentNote: note },
          events: [{ kind: 'PAYMENT', status: 'PLACED', note: `Payment rejected: ${note}`, actor }],
        });
        if (!ok) throw stale();
        await notificationService.queueFor(await orderRepository.findForMail(orderId), ['CUSTOMER_PAYMENT_REJECTED'], { reason: note });
        return;
      }
      case 'MARK_COLLECTED': {
        const okStatus = ['OUT_FOR_DELIVERY', 'DELIVERED', 'EXCHANGE_REQUESTED', 'EXCHANGED'].includes(order.status);
        if (order.paymentMethod !== 'COD' || order.paymentStatus !== 'UNPAID' || !okStatus) throw AppError.conflict('Cash can only be marked collected for a COD order that is out for delivery or delivered.');
        const ok = await orderRepository.applyChange({
          orderId, fromPayment: 'UNPAID', data: { paymentStatus: 'PAID' },
          events: [{ kind: 'PAYMENT', status: order.status, note: 'Cash collected', actor }],
        });
        if (!ok) throw stale();
        return;
      }
      case 'MARK_REFUNDED': {
        if (order.paymentStatus !== 'REFUND_DUE') throw AppError.conflict('No refund is due on this order.');
        const ok = await orderRepository.applyChange({
          orderId, fromPayment: 'REFUND_DUE', data: { paymentStatus: 'REFUNDED' },
          events: [{ kind: 'PAYMENT', status: order.status, note: note ? `Refunded: ${note}` : 'Refund sent', actor }],
        });
        if (!ok) throw stale();
        return;
      }
    }
  },
};