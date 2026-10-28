import { api } from '@/services/api';
import type { Order } from '../types';

export const orderService = {
  list: async () => (await api.get<{ data: Order[] }>('/orders')).data.data,
  get: async (id: string) => (await api.get<{ data: Order }>(`/orders/${id}`)).data.data,
  track: async (b: { orderNumber: string; email: string }) => (await api.post<{ data: Order }>('/track-order', b)).data.data,
};
