import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { wishlistService } from '../services/wishlistService';

export const useWishlist = () => {
  const authed = !!useAuthStore((s) => s.user);
  return useQuery({ queryKey: ['wishlist'], queryFn: wishlistService.list, enabled: authed });
};

export const useToggleWishlist = (productId: string) => {
  const authed = !!useAuthStore((s) => s.user);
  const nav = useNavigate(); const loc = useLocation(); const qc = useQueryClient();
  const { data } = useWishlist();
  const active = !!data?.some((p) => p.id === productId);
  const m = useMutation({
    mutationFn: () => (active ? wishlistService.remove(productId) : wishlistService.add(productId)),
    onSuccess: (list) => qc.setQueryData(['wishlist'], list),
  });
  return { active, pending: m.isPending, toggle: () => (authed ? m.mutate() : nav('/login', { state: { from: loc.pathname + loc.search } })) };
};
