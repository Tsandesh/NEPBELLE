import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/utils/cn';
import { formatCurrency } from '@/utils/format';
import { getErrorMessage } from '@/services/api';
import { useCart } from '@/features/cart/hooks/useCart';
import { useCheckoutStore } from '@/features/checkout/hooks/useCheckoutStore';
import { checkoutService } from '@/features/checkout/services/checkoutService';
import { OrderSummaryPanel } from '@/features/checkout/components/OrderSummaryPanel';

type Method = 'COD' | 'PAYID';
const TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const Copy = ({ value, label }: { value: string; label: string }) => {
  const [done, setDone] = useState(false);
  return (
    <button type="button" aria-label={`Copy ${label}`} className="ml-2 text-2xs underline"
      onClick={() => navigator.clipboard.writeText(value).then(() => { setDone(true); setTimeout(() => setDone(false), 1500); })}>
      {done ? 'Copied' : 'Copy'}
    </button>
  );
};

export default function CheckoutPaymentPage() {
  const nav = useNavigate();
  const qc = useQueryClient();
  const { shipping, reset } = useCheckoutStore();
  const { data: cart } = useCart();
  const [method, setMethod] = useState<Method>('PAYID');
  const [file, setFile] = useState<File | null>(null);
  const [receipt, setReceipt] = useState('');
  const [fileError, setFileError] = useState<string>();

  const info = useQuery({ queryKey: ['payment-info'], queryFn: checkoutService.paymentInfo, staleTime: 300_000 });
  const ref = useQuery({ queryKey: ['checkout-ref'], queryFn: checkoutService.reference, enabled: method === 'PAYID', staleTime: Infinity });
  const preview = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  const place = useMutation({
    mutationFn: () => {
      const { saveAddress, ...address } = shipping!;
      return checkoutService.placeOrder({
        shippingAddress: address, saveAddress, paymentMethod: method, expectedTotalCents: cart!.totalCents,
        ...(method === 'PAYID' ? { reference: ref.data, payidReceiptNumber: receipt.trim() || undefined, proof: file } : {}),
      });
    },
    onSuccess: (order) => {
      reset();
      ['cart', 'orders', 'products', 'product'].forEach((k) => qc.invalidateQueries({ queryKey: [k] }));
      nav(`/orders/${order.id}/confirmation`, { replace: true });
    },
  });

  if (!shipping) return <Navigate to="/checkout/shipping" replace />;
  if (!cart) return <div className="container-nb py-12"><Skeleton className="h-64 w-full" /></div>;
  if (!cart.items.length) return <Navigate to="/cart" replace />;

  const codBlocked = !!info.data?.codMaxCents && cart.totalCents > info.data.codMaxCents;
  const pick = (f: File | undefined) => {
    setFileError(undefined);
    if (!f) return;
    if (!TYPES.includes(f.type)) return setFileError('Use a JPG, PNG or WebP screenshot.');
    if (f.size > 5 * 1024 * 1024) return setFileError('The screenshot must be 5 MB or smaller.');
    setFile(f);
  };
  const canSubmit = method === 'COD' ? !codBlocked : !!file && !!ref.data;

  return (
    <div className="container-nb grid gap-10 py-10 lg:grid-cols-[1fr_380px]">
      <section className="space-y-5 border border-line-soft bg-white p-6">
        <h1 className="font-serif text-display">Payment</h1>
        <div className="bg-canvas p-4 text-sm"><p className="font-serif font-extrabold">Ship to</p>
          <p className="text-muted-foreground">{shipping.fullName}, {shipping.line1}, {shipping.city} {shipping.state} {shipping.postcode} · {shipping.phone}</p></div>

        <fieldset className="space-y-3"><legend className="sr-only">Payment method</legend>
          {([
            ['PAYID', 'Pay with PayID', 'Instant bank transfer. Upload a screenshot after paying.'],
            ['COD', 'Cash on delivery', codBlocked ? `Available for orders up to ${formatCurrency(info.data!.codMaxCents)}.` : 'Pay in cash when your order arrives.'],
          ] as const).map(([id, label, hint]) => (
            <label key={id} className={cn('flex items-start gap-3 border p-4', id === 'COD' && codBlocked ? 'cursor-not-allowed opacity-50' : 'cursor-pointer', method === id ? 'border-brand bg-brand-tint' : 'border-line')}>
              <input type="radio" name="pay" className="mt-1 accent-[var(--brand)]" disabled={id === 'COD' && codBlocked} checked={method === id} onChange={() => setMethod(id)} />
              <span><span className="block font-serif font-extrabold">{label}</span><span className="text-2xs text-muted-foreground">{hint}</span></span>
            </label>))}
        </fieldset>

        {method === 'PAYID' && (
          <div className="space-y-5 border border-line-soft p-5">
            <ol className="list-decimal space-y-2 pl-5 text-sm">
              <li>Open your banking app and choose <b>Pay anyone → PayID</b>.</li>
              <li>PayID: <b>{info.data?.payId ?? '…'}</b>{info.data && <Copy value={info.data.payId} label="PayID" />}
                <br /><span className="text-2xs text-muted-foreground">Your bank should show the name “{info.data?.accountName}”. If it doesn’t match, stop and contact us.</span></li>
              <li>Amount: <b>{formatCurrency(cart.totalCents)}</b><Copy value={(cart.totalCents / 100).toFixed(2)} label="amount" /></li>
              <li>In the <b>description / reference</b>, enter: <b>{ref.data ?? '…'}</b>{ref.data && <Copy value={ref.data} label="reference" />}
                <br /><span className="text-2xs text-muted-foreground">This is how we match your payment to your order.</span></li>
              <li>Take a screenshot of the successful payment and upload it below.</li>
            </ol>

            <div className="space-y-2">
              <label htmlFor="proof" className="font-serif text-[13px] font-extrabold">Payment screenshot (required)</label>
              <input id="proof" type="file" accept={TYPES.join(',')} onChange={(e) => pick(e.target.files?.[0])}
                className="block w-full text-sm file:mr-3 file:border-0 file:bg-brand file:px-4 file:py-2 file:text-white" />
              {preview && <img src={preview} alt="Your payment screenshot" className="max-h-48 border border-line" />}
              {fileError && <p role="alert" className="text-2xs text-brand">{fileError}</p>}
            </div>
            <Input label="Receipt number from your bank (optional)" value={receipt} onChange={(e) => setReceipt(e.target.value)} maxLength={60} placeholder="e.g. the receipt number shown in your banking app" />
          </div>
        )}

        {place.isError && <p role="alert" className="text-sm text-brand">{getErrorMessage(place.error)}</p>}
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="secondary"><Link to="/checkout/shipping">Back</Link></Button>
          <Button loading={place.isPending} disabled={!canSubmit} onClick={() => place.mutate()}>
            {method === 'COD' ? 'Place order (pay on delivery)' : 'I’ve paid, place order'}
          </Button>
        </div>
        {method === 'PAYID' && !file && <p className="text-2xs text-muted-foreground">Upload your payment screenshot to enable the button.</p>}
      </section>
      <OrderSummaryPanel />
    </div>
  );
}
