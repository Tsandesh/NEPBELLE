import { api } from '@/services/api';
import type { Order } from '@/features/orders/types';
import type { AddressForm } from '@/utils/validation';

export interface PaymentInfo { payId: string; accountName: string; codMaxCents: number }

export const checkoutService = {
  paymentInfo: async () => (await api.get<{ data: PaymentInfo }>('/checkout/payment-info')).data.data,
  reference: async () => (await api.get<{ data: { reference: string } }>('/checkout/reference')).data.data.reference,

  /** Sent as multipart: the JSON goes in a "payload" field and the PayID screenshot (if any) in "proof". */
  placeOrder: async (p: {
    shippingAddress: Omit<AddressForm, 'saveAddress'>; saveAddress?: boolean; paymentMethod: 'COD' | 'PAYID';
    reference?: string; payidReceiptNumber?: string; expectedTotalCents: number; proof?: File | null;
  }) => {
    const { proof, ...payload } = p;
    const fd = new FormData();
    fd.append('payload', JSON.stringify(payload));
    if (proof) fd.append('proof', proof);
    return (await api.post<{ data: Order }>('/orders', fd)).data.data;
  },

  addresses: async () =>
    (await api.get<{ data: (Omit<AddressForm, 'saveAddress'> & { id: string; isDefault: boolean })[] }>('/me/addresses')).data.data,
};
