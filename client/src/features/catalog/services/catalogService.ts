import { api, type ApiEnvelope } from '@/services/api';
import type { Category, Facets, Product, ProductFilters } from '../types';

export const catalogService = {
  list: async (f: ProductFilters) => {
    const params = { ...f, sizes: f.sizes?.join(','), colours: f.colours?.join(',') };
    const { data } = await api.get<ApiEnvelope<Product[]>>('/products', { params });
    return { items: data.data, meta: data.meta! };
  },
  detail: async (slug: string) => (await api.get<ApiEnvelope<Product>>(`/products/${slug}`)).data.data,
  facets: async (category?: string) => (await api.get<ApiEnvelope<Facets>>('/products/facets', { params: { category } })).data.data,
  categories: async () => (await api.get<ApiEnvelope<Category[]>>('/categories')).data.data,
};
