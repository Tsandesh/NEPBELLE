import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminOrderService } from '../services/adminOrderService';
import type { OrderFilters } from '../types/orders';

export const useAdminOrders = (f: OrderFilters) =>
  useQuery({ queryKey: ['admin', 'orders', f], queryFn: () => adminOrderService.list(f), placeholderData: keepPreviousData });

// polls every 30s so new orders and payment proofs show up (and the nav badge updates) without a refresh
export const useAdminSummary = () =>
  useQuery({ queryKey: ['admin', 'summary'], queryFn: adminOrderService.summary, refetchInterval: 30_000 });

export const useAdminOrder = (id?: string) =>
  useQuery({ queryKey: ['admin', 'order', id], queryFn: () => adminOrderService.get(id!), enabled: !!id });

const useRefreshOrders = (id: string) => {
  const qc = useQueryClient();
  return (order?: unknown) => {
    if (order) qc.setQueryData(['admin', 'order', id], order);
    qc.invalidateQueries({ queryKey: ['admin', 'orders'] });
    qc.invalidateQueries({ queryKey: ['admin', 'summary'] });
    qc.invalidateQueries({ queryKey: ['admin', 'order', id] });
  };
};

export const useChangeStatus = (id: string) => {
  const refresh = useRefreshOrders(id);
  return useMutation({ mutationFn: (b: Parameters<typeof adminOrderService.changeStatus>[1]) => adminOrderService.changeStatus(id, b), onSuccess: refresh });
};
export const usePaymentAction = (id: string) => {
  const refresh = useRefreshOrders(id);
  return useMutation({ mutationFn: (b: Parameters<typeof adminOrderService.payment>[1]) => adminOrderService.payment(id, b), onSuccess: refresh });
};
export const useAddNote = (id: string) => {
  const refresh = useRefreshOrders(id);
  return useMutation({ mutationFn: (note: string) => adminOrderService.note(id, note), onSuccess: () => refresh() });
};