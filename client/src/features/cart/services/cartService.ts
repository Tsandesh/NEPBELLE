import { api } from '@/services/api';
import type { Cart } from '../types';

export const cartService = {
  get: async () => (await api.get<{ data: Cart }>('/cart')).data.data,
  add: async (variantId: string, quantity = 1) => (await api.post<{ data: Cart }>('/cart/items', { variantId, quantity })).data.data,
  update: async (id: string, quantity: number) => (await api.patch<{ data: Cart }>(`/cart/items/${id}`, { quantity })).data.data,
  remove: async (id: string) => (await api.delete<{ data: Cart }>(`/cart/items/${id}`)).data.data,
  merge: async (items: { variantId: string; quantity: number }[]) => (await api.post<{ data: Cart }>('/cart/merge', { items })).data.data,
};
