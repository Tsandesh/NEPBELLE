import { create } from 'zustand';
import type { AddressForm } from '@/utils/validation';

interface S {
  shipping: AddressForm | null; setShipping: (a: AddressForm) => void;
  paymentMethod: 'card' | 'cod'; setPaymentMethod: (m: 'card' | 'cod') => void; reset: () => void;
}
export const useCheckoutStore = create<S>((set) => ({
  shipping: null, setShipping: (shipping) => set({ shipping }),
  paymentMethod: 'card', setPaymentMethod: (paymentMethod) => set({ paymentMethod }),
  reset: () => set({ shipping: null, paymentMethod: 'card' }),
}));
