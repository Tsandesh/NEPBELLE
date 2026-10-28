export interface OrderItem { id: string; productName: string; productSlug: string; productImage: string; size: string; colourName: string; unitPriceCents: number; quantity: number }
export interface Order {
  id: string; orderNumber: string; status: string; placedAt: string;
  subtotalCents: number; shippingCents: number; totalCents: number; paymentMethod: string; paymentStatus: string;
  shippingAddress: Record<string, string>; items: OrderItem[];
  timeline: { status: string; done: boolean; at: string | null }[];
}
