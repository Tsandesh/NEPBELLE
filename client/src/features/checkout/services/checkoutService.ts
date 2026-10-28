import { api } from '@/services/api';
import type { Order } from '@/features/orders/types';
import type { AddressForm } from '@/utils/validation';

export const checkoutService = {
  placeOrder: async (b: { shippingAddress: Omit<AddressForm, 'saveAddress'>; saveAddress?: boolean; paymentMethod: 'card' | 'cod' }) =>
    (await api.post<{ data: Order }>('/orders', b)).data.data,
  addresses: async () => (await api.get<{ data: (Omit<AddressForm, 'saveAddress'> & { id: string; isDefault: boolean })[] }>('/me/addresses')).data.data,
};
