
import { api, type ApiEnvelope } from '@/services/api';
import type { AdminOrderDetail, AdminOrderRow, AdminSummary, OrderFilters } from '../types/orders';

const d = <T,>(p: Promise<{ data: { data: T } }>) => p.then((r) => r.data.data);

export const adminOrderService = {
  list: async (f: OrderFilters) => {
    const { data } = await api.get<ApiEnvelope<AdminOrderRow[]>>('/admin/orders', { params: f });
    return { items: data.data, meta: data.meta! };
  },
  summary: () => d<AdminSummary>(api.get('/admin/orders/summary')),
  get: (id: string) => d<AdminOrderDetail>(api.get(`/admin/orders/${id}`)),
  proof: async (id: string) => (await api.get<Blob>(`/admin/orders/${id}/proof`, { responseType: 'blob' })).data,
  changeStatus: (id: string, body: { status: string; note?: string; courier?: string; trackingNumber?: string; cashCollected?: boolean }) =>
    d<AdminOrderDetail>(api.post(`/admin/orders/${id}/status`, body)),
  payment: (id: string, body: { action: 'VERIFY' | 'REJECT' | 'MARK_COLLECTED' | 'MARK_REFUNDED'; note?: string }) =>
    d<AdminOrderDetail>(api.post(`/admin/orders/${id}/payment`, body)),
  note: (id: string, note: string) => api.post(`/admin/orders/${id}/note`, { note }),
};