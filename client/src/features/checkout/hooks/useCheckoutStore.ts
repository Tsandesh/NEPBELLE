import { create } from 'zustand';
import type { AddressForm } from '@/utils/validation';

// Holds the shipping address between the Shipping and Payment steps.
interface CheckoutState {
  shipping: AddressForm | null;
  setShipping: (a: AddressForm) => void;
  reset: () => void;
}

export const useCheckoutStore = create<CheckoutState>((set) => ({
  shipping: null,
  setShipping: (shipping) => set({ shipping }),
  reset: () => set({ shipping: null }),
}));
