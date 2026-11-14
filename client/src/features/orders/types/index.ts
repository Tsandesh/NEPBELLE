export type OrderStatus = 'PLACED' | 'CONFIRMED' | 'PACKED' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED' | 'EXCHANGE_REQUESTED' | 'EXCHANGED';
export type PaymentStatus = 'UNPAID' | 'PROOF_SUBMITTED' | 'PAID' | 'REJECTED' | 'REFUND_DUE' | 'REFUNDED';

export interface OrderItem { id: string; productName: string; productSlug: string; productImage: string; size: string; colourName: string; unitPriceCents: number; quantity: number }
export interface Order {
  id: string; orderNumber: string; status: OrderStatus; placedAt: string;
  subtotalCents: number; shippingCents: number; totalCents: number;
  paymentMethod: 'COD' | 'PAYID'; paymentStatus: PaymentStatus; payidReceiptNumber: string | null; paymentNote: string | null; hasProof: boolean;
  courier: string | null; trackingNumber: string | null; cancelReason: string | null;
  canResubmitProof: boolean; canRequestExchange: boolean;
  shippingAddress: Record<string, string>; items: OrderItem[];
  timeline: { status: string; done: boolean; at: string | null }[];
}
