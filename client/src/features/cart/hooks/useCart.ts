import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useGuestCart } from '@/store/guestCartStore';
import { useUiStore } from '@/store/uiStore';
import { cartService } from '../services/cartService';
import type { Cart } from '../types';

export const useCart = () => {
  const authed = !!useAuthStore((s) => s.user);
  return useQuery({ queryKey: ['cart'], queryFn: cartService.get, enabled: authed });
};

const useCartMutation = <V,>(fn: (v: V) => Promise<Cart>) => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: fn, onSuccess: (cart) => qc.setQueryData(['cart'], cart) });
};

export const useUpdateCartItem = () => useCartMutation(({ id, quantity }: { id: string; quantity: number }) => cartService.update(id, quantity));
export const useRemoveCartItem = () => useCartMutation((id: string) => cartService.remove(id));

/** Authed: add + open the bag drawer (matches "Add to Cart / Open Drawer" flow). Guest: stash locally, send to login; merged afterwards. */
export const useAddToBag = () => {
  const authed = !!useAuthStore((s) => s.user);
  const guest = useGuestCart();
  const nav = useNavigate();
  const loc = useLocation();
  const setBagOpen = useUiStore((s) => s.setBagOpen);
  const add = useCartMutation(({ variantId, quantity }: { variantId: string; quantity: number }) => cartService.add(variantId, quantity));
  return {
    ...add,
    addToBag: (variantId: string, quantity = 1) => {
      if (!authed) { guest.add({ variantId, quantity }); nav('/login', { state: { from: loc.pathname + loc.search, reason: 'bag' } }); return; }
      add.mutate({ variantId, quantity }, { onSuccess: () => setBagOpen(true) });
    },
  };
};
