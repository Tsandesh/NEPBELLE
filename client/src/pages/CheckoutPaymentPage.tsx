import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';
import { getErrorMessage } from '@/services/api';
import { useCheckoutStore } from '@/features/checkout/hooks/useCheckoutStore';
import { checkoutService } from '@/features/checkout/services/checkoutService';
import { OrderSummaryPanel } from '@/features/checkout/components/OrderSummaryPanel';

// Figma 03.3 Checkout / Payment. Options are placeholders until that frame is mapped; real card capture belongs in the PSP's hosted fields.
const METHODS = [{ id: 'card', label: 'Credit / debit card', hint: 'You’ll be asked for card details by our payment provider.' }, { id: 'cod', label: 'Pay on delivery', hint: 'Pay when your order arrives.' }] as const;

export default function CheckoutPaymentPage() {
  const nav = useNavigate(); const qc = useQueryClient();
  const { shipping, paymentMethod, setPaymentMethod, reset } = useCheckoutStore();
  const place = useMutation({
    mutationFn: () => { const { saveAddress, ...address } = shipping!; return checkoutService.placeOrder({ shippingAddress: address, saveAddress, paymentMethod }); },
    onSuccess: (order) => { reset(); qc.invalidateQueries({ queryKey: ['cart'] }); qc.invalidateQueries({ queryKey: ['orders'] }); qc.invalidateQueries({ queryKey: ['products'] }); nav(`/orders/${order.id}/confirmation`, { replace: true }); },
  });
  if (!shipping) return <Navigate to="/checkout/shipping" replace />;
  return (
    <div className="container-nb grid gap-10 py-10 lg:grid-cols-[1fr_380px]">
      <section className="space-y-5 border border-line-soft bg-white p-6">
        <h1 className="font-serif text-display">Payment</h1>
        <div className="bg-canvas p-4 text-sm"><p className="font-serif font-extrabold">Ship to</p><p className="text-muted-foreground">{shipping.fullName}, {shipping.line1}, {shipping.city} {shipping.state} {shipping.postcode}</p></div>
        <fieldset className="space-y-3"><legend className="sr-only">Payment method</legend>
          {METHODS.map((m) => (
            <label key={m.id} className={cn('flex cursor-pointer items-start gap-3 border p-4', paymentMethod === m.id ? 'border-brand bg-brand-tint' : 'border-line hover:border-brand')}>
              <input type="radio" name="pay" className="mt-1 accent-[var(--brand)]" checked={paymentMethod === m.id} onChange={() => setPaymentMethod(m.id)} />
              <span><span className="block font-serif font-extrabold">{m.label}</span><span className="text-2xs text-muted-foreground">{m.hint}</span></span>
            </label>))}
        </fieldset>
        {place.isError && <p role="alert" className="text-2xs text-brand">{getErrorMessage(place.error)}</p>}
        <div className="flex flex-wrap gap-3"><Button asChild variant="secondary"><Link to="/checkout/shipping">Back</Link></Button><Button loading={place.isPending} onClick={() => place.mutate()}>Place order</Button></div>
      </section>
      <OrderSummaryPanel />
    </div>
  );
}
