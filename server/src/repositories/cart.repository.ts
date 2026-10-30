import { prisma } from '../config/db.js';

const include = {
  items: {
    orderBy: { id: 'asc' as const },
    include: { variant: { include: { colour: true, product: { select: { id: true, slug: true, name: true, priceCents: true, images: true } } } } },
  },
};

export const cartRepository = {
  async getOrCreate(userId: string) {
    return prisma.cart.upsert({ where: { userId }, create: { userId }, update: {}, include });
  },
  findVariant: (id: string) => prisma.variant.findUnique({ where: { id } }),
  async upsertItem(cartId: string, variantId: string, quantity: number) {
    return prisma.cartItem.upsert({
      where: { cartId_variantId: { cartId, variantId } },
      create: { cartId, variantId, quantity },
      update: { quantity: { increment: quantity } },
    });
  },
  setQuantity: (cartId: string, id: string, quantity: number) =>
    prisma.cartItem.updateMany({ where: { id, cartId }, data: { quantity } }),
  removeItem: (cartId: string, id: string) => prisma.cartItem.deleteMany({ where: { id, cartId } }),
  findItem: (cartId: string, id: string) => prisma.cartItem.findFirst({ where: { id, cartId }, include: { variant: true } }),
  clear: (cartId: string) => prisma.cartItem.deleteMany({ where: { cartId } }),
};
