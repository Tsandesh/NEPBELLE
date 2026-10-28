export interface CartItem {
  id: string; variantId: string; quantity: number; size: string; colour: { name: string; hex: string }; stock: number;
  product: { id: string; slug: string; name: string; image: string | null };
  unitPriceCents: number; lineTotalCents: number;
}
export interface Cart { id: string; items: CartItem[]; itemCount: number; subtotalCents: number; shippingCents: number; totalCents: number; currency: string }
