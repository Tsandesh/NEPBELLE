import { AppError } from '../utils/AppError.js';
import { calcShipping } from '../utils/pricing.js';
import { cartRepository } from '../repositories/cart.repository.js';

type CartWithItems = Awaited<ReturnType<typeof cartRepository.getOrCreate>>;

export const toCartDTO = (cart: CartWithItems) => {
  const items = cart.items.map((i) => ({
    id: i.id, variantId: i.variantId, quantity: i.quantity, size: i.variant.size,
    colour: { name: i.variant.colour.name, hex: i.variant.colour.hex },
    stock: i.variant.stock,
    product: { id: i.variant.product.id, slug: i.variant.product.slug, name: i.variant.product.name, image: i.variant.product.images[0] ?? null },
    unitPriceCents: i.variant.product.priceCents,
    lineTotalCents: i.variant.product.priceCents * i.quantity,
  }));
  const subtotalCents = items.reduce((n, i) => n + i.lineTotalCents, 0);
  const shippingCents = calcShipping(subtotalCents);
  return {
    id: cart.id, items, itemCount: items.reduce((n, i) => n + i.quantity, 0),
    subtotalCents, shippingCents, totalCents: subtotalCents + shippingCents, currency: 'AUD',
  };
};

export const cartService = {
  async get(userId: string) { return toCartDTO(await cartRepository.getOrCreate(userId)); },

  async add(userId: string, variantId: string, quantity: number) {
    const cart = await cartRepository.getOrCreate(userId);
    const variant = await cartRepository.findVariant(variantId);
    if (!variant) throw AppError.notFound('This size/colour is no longer available.');
    const existing = cart.items.find((i) => i.variantId === variantId)?.quantity ?? 0;
    if (existing + quantity > variant.stock) throw AppError.conflict(variant.stock === 0 ? 'Sold out.' : `Only ${variant.stock} left in stock.`);
    await cartRepository.upsertItem(cart.id, variantId, quantity);
    return this.get(userId);
  },

  async setQuantity(userId: string, itemId: string, quantity: number) {
    const cart = await cartRepository.getOrCreate(userId);
    const item = await cartRepository.findItem(cart.id, itemId);
    if (!item) throw AppError.notFound('Cart item not found');
    if (quantity > item.variant.stock) throw AppError.conflict(`Only ${item.variant.stock} left in stock.`);
    await cartRepository.setQuantity(cart.id, itemId, quantity);
    return this.get(userId);
  },

  async remove(userId: string, itemId: string) {
    const cart = await cartRepository.getOrCreate(userId);
    await cartRepository.removeItem(cart.id, itemId);
    return this.get(userId);
  },

  /** Merge a guest (localStorage) cart after login. Silently clamps to available stock. */
  async merge(userId: string, items: { variantId: string; quantity: number }[]) {
    const cart = await cartRepository.getOrCreate(userId);
    for (const { variantId, quantity } of items) {
      const variant = await cartRepository.findVariant(variantId);
      if (!variant || variant.stock === 0) continue;
      const existing = cart.items.find((i) => i.variantId === variantId)?.quantity ?? 0;
      const add = Math.min(quantity, variant.stock - existing);
      if (add > 0) await cartRepository.upsertItem(cart.id, variantId, add);
    }
    return this.get(userId);
  },
};
