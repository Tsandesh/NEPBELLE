import { api } from '@/services/api';
import type { Product } from '@/features/catalog/types';

export const wishlistService = {
  list: async () => (await api.get<{ data: Product[] }>('/wishlist')).data.data,
  add: async (id: string) => (await api.put<{ data: Product[] }>(`/wishlist/${id}`)).data.data,
  remove: async (id: string) => (await api.delete<{ data: Product[] }>(`/wishlist/${id}`)).data.data,
};
