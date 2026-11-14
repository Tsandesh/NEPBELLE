
import type { OrderStatus, PaymentStatus } from '@/features/orders/types';

export interface AdminOrderRow {
  id: string; orderNumber: string; placedAt: string; customerName: string; phone: string; email: string; totalCents: number;
  status: OrderStatus; paymentMethod: 'COD' | 'PAYID'; paymentStatus: PaymentStatus; itemCount: number;
}
export interface AdminOrderDetail extends AdminOrderRow {
  subtotalCents: number; shippingCents: number; shippingAddress: Record<string, string>;
  payidReceiptNumber: string | null; paymentNote: string | null; courier: string | null; trackingNumber: string | null; cancelReason: string | null;
  hasProof: boolean; duplicateReceipt: string[]; allowedNext: OrderStatus[];
  items: { id: string; productName: string; size: string; colourName: string; unitPriceCents: number; quantity: number; productImage: string }[];
  events: { id: string; kind: string; status: OrderStatus; note: string | null; actor: string; createdAt: string }[];
  notifications: { id: string; channel: string; event: string; recipient: string; status: string; attempts: number; lastError: string | null; createdAt: string; sentAt: string | null }[];
}
export interface AdminSummary {
  byStatus: Record<string, number>; proofsToCheck: number; refundsDue: number; codToCollect: number; needsAction: number; paidRevenueCents: number;
}
export interface OrderFilters { status?: string; paymentStatus?: string; method?: string; q?: string; page?: number }