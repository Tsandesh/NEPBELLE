import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { useGuestCart } from '@/store/guestCartStore';
import { cartService } from '@/features/cart/services/cartService';
import { authService } from '../services/authService';

export const useAuth = () => {
  const { user, bootstrapped } = useAuthStore();
  return { user, isAuthenticated: !!user, bootstrapped };
};

/** Called once on app start: silently restores the session from the httpOnly refresh cookie. */
export const bootstrapSession = async () => {
  const { setSession, setBootstrapped } = useAuthStore.getState();
  try { const s = await authService.refresh(); setSession(s.user, s.accessToken); } catch { /* guest */ }
  setBootstrapped();
};

const useAfterLogin = () => {
  const qc = useQueryClient();
  const setSession = useAuthStore((s) => s.setSession);
  return async (s: { user: any; accessToken: string }) => {
    setSession(s.user, s.accessToken);
    const guest = useGuestCart.getState();
    if (guest.lines.length) { await cartService.merge(guest.lines).catch(() => undefined); guest.clear(); }
    await qc.invalidateQueries({ queryKey: ['cart'] });
    await qc.invalidateQueries({ queryKey: ['wishlist'] });
  };
};

export const useLogin = () => { const after = useAfterLogin(); return useMutation({ mutationFn: authService.login, onSuccess: after }); };
export const useRegister = () => { const after = useAfterLogin(); return useMutation({ mutationFn: authService.register, onSuccess: after }); };
export const useLogout = () => {
  const qc = useQueryClient();
  const clear = useAuthStore((s) => s.clear);
  return useMutation({ mutationFn: authService.logout, onSettled: () => { clear(); qc.clear(); } });
};
