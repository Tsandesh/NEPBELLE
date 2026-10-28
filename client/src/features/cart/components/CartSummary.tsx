import type { Cart } from '../types';
import { formatCurrency } from '@/utils/format';

export const CartSummary = ({ cart }: { cart: Pick<Cart, 'subtotalCents' | 'shippingCents' | 'totalCents'> }) => (
  <dl className="space-y-2 text-sm">
    <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatCurrency(cart.subtotalCents)}</dd></div>
    <div className="flex justify-between"><dt>Shipping</dt><dd>{cart.shippingCents === 0 ? 'Free' : formatCurrency(cart.shippingCents)}</dd></div>
    <div className="flex justify-between border-t border-line pt-2 font-serif text-base font-extrabold"><dt>Total</dt><dd>{formatCurrency(cart.totalCents)}</dd></div>
  </dl>
);
