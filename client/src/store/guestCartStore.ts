import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface GuestLine { variantId: string; quantity: number }
interface State {
  lines: GuestLine[];
  add: (l: GuestLine) => void;
  clear: () => void;
}
export const useGuestCart = create<State>()(
  persist(
    (set) => ({
      lines: [],
      add: (l) => set((s) => {
        const ex = s.lines.find((x) => x.variantId === l.variantId);
        return { lines: ex ? s.lines.map((x) => (x === ex ? { ...x, quantity: Math.min(10, x.quantity + l.quantity) } : x)) : [...s.lines, l] };
      }),
      clear: () => set({ lines: [] }),
    }),
    { name: 'nb_guest_cart' },
  ),
);
