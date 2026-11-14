import { api } from '@/services/api';
import type { Order } from '../types';

export const orderService = {
  list: async () => (await api.get<{ data: Order[] }>('/orders')).data.data,
  get: async (id: string) => (await api.get<{ data: Order }>(`/orders/${id}`)).data.data,
  track: async (b: { orderNumber: string; email: string }) => (await api.post<{ data: Order }>('/track-order', b)).data.data,
  resubmitProof: async (id: string, file: File, receipt?: string) => {
    const fd = new FormData();
    fd.append('proof', file);
    if (receipt) fd.append('payidReceiptNumber', receipt);
    return (await api.post<{ data: Order }>(`/orders/${id}/payment-proof`, fd)).data.data;
  },
  requestExchange: async (id: string, reason: string) =>
    (await api.post<{ data: Order }>(`/orders/${id}/exchange-request`, { reason })).data.data,
};
