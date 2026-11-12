import { useMutation, useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { orderService } from '../services/orderService';

export const useOrders = () => {
  const authed = !!useAuthStore((s) => s.user);
  return useQuery({ queryKey: ['orders'], queryFn: orderService.list, enabled: authed });
};
export const useOrder = (id?: string) =>
  useQuery({ queryKey: ['order', id], queryFn: () => orderService.get(id!), enabled: !!id });
export const useTrackOrder = () => useMutation({ mutationFn: orderService.track });
