import { prisma } from '../config/db.js';
import { productInclude } from './product.repository.js';

export const wishlistRepository = {
  list: (userId: string) =>
    prisma.wishlistItem.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, include: { product: { include: productInclude } } }),
  add: (userId: string, productId: string) =>
    prisma.wishlistItem.upsert({ where: { userId_productId: { userId, productId } }, create: { userId, productId }, update: {} }),
  remove: (userId: string, productId: string) => prisma.wishlistItem.deleteMany({ where: { userId, productId } }),
};
