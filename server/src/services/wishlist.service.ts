import { AppError } from '../utils/AppError.js';
import { productRepository } from '../repositories/product.repository.js';
import { wishlistRepository } from '../repositories/wishlist.repository.js';
import { toProductDTO } from './mappers.js';

export const wishlistService = {
  async list(userId: string) { return (await wishlistRepository.list(userId)).map((w) => toProductDTO(w.product)); },
  async add(userId: string, productId: string) {
    const [p] = await productRepository.findByIds([productId]);
    if (!p) throw AppError.notFound('Product not found');
    await wishlistRepository.add(userId, productId);
    return this.list(userId);
  },
  async remove(userId: string, productId: string) {
    await wishlistRepository.remove(userId, productId);
    return this.list(userId);
  },
};
