import type { OrderStatus } from '@prisma/client';

export const TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PLACED: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PACKED', 'CANCELLED'],
  PACKED: ['OUT_FOR_DELIVERY', 'CANCELLED'],
  OUT_FOR_DELIVERY: ['DELIVERED', 'CANCELLED'],
  DELIVERED: ['EXCHANGE_REQUESTED'],
  EXCHANGE_REQUESTED: ['EXCHANGED', 'DELIVERED'],
  EXCHANGED: [],
  CANCELLED: [],
};

export const STATUS_LABEL: Record<OrderStatus, string> = {
  PLACED: 'Placed', CONFIRMED: 'Confirmed', PACKED: 'Packed', OUT_FOR_DELIVERY: 'Out for delivery',
  DELIVERED: 'Delivered', CANCELLED: 'Cancelled', EXCHANGE_REQUESTED: 'Exchange requested', EXCHANGED: 'Exchanged',
};

export const canTransition = (from: OrderStatus, to: OrderStatus) => TRANSITIONS[from].includes(to);