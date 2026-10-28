import { AppError } from '../utils/AppError.js';
import { cached, hashKey } from '../utils/cache.js';
import { productRepository } from '../repositories/product.repository.js';
import type { ProductQuery } from '../validators/index.js';
import { toProductDTO } from './mappers.js';

export const productService = {
  list: (q: ProductQuery) =>
    cached(`list:${hashKey(q)}`, 60, async () => {
      const { items, total } = await productRepository.list(q);
      return { items: items.map(toProductDTO), meta: { page: q.page, limit: q.limit, total, totalPages: Math.max(1, Math.ceil(total / q.limit)) } };
    }),

  bySlug: (slug: string) =>
    cached(`detail:${slug}`, 120, async () => {
      const p = await productRepository.findBySlug(slug);
      if (!p) throw AppError.notFound('Product not found');
      return toProductDTO(p);
    }),

  facets: (category?: string) => cached(`facets:${category ?? 'all'}`, 300, () => productRepository.facets(category)),
  categories: () => cached('categories', 600, () => productRepository.categories()),
};
