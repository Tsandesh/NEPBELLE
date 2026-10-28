import { create } from 'zustand';

export interface User { id: string; email: string; firstName: string; lastName: string; phone: string | null; role: string }
interface AuthState {
  user: User | null;
  accessToken: string | null; // memory only; refresh token lives in an httpOnly cookie
  bootstrapped: boolean;
  setSession: (u: User, t: string) => void;
  clear: () => void;
  setBootstrapped: () => void;
}
export const useAuthStore = create<AuthState>((set) => ({
  user: null, accessToken: null, bootstrapped: false,
  setSession: (user, accessToken) => set({ user, accessToken }),
  clear: () => set({ user: null, accessToken: null }),
  setBootstrapped: () => set({ bootstrapped: true }),
}));
