import { useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getErrorMessage } from '@/services/api';
import { formatCurrency } from '@/utils/format';
import { CartSummary } from '@/features/cart/components/CartSummary';
import { orderService } from '../services/orderService';
import type { Order } from '../types';
import { OrderItems } from './OrderItems';
import { OrderTimeline } from './OrderTimeline';

const Banner = ({ tone, children }: { tone: 'info' | 'warn' | 'bad'; children: React.ReactNode }) => (
  <div role="status" className={`border p-4 text-sm ${tone === 'bad' ? 'border-brand bg-brand-tint' : tone === 'warn' ? 'border-amber-300 bg-amber-50' : 'border-line bg-canvas'}`}>{children}</div>
);

const stateMessage = (o: Order) => {
  if (o.status === 'CANCELLED') return <Banner tone="bad"><b>This order was cancelled.</b> {o.cancelReason && <>Reason: {o.cancelReason}.</>} {o.paymentStatus === 'REFUND_DUE' && 'Your PayID refund is being processed.'} {o.paymentStatus === 'REFUNDED' && 'Your refund has been sent.'}</Banner>;
  if (o.paymentMethod === 'PAYID' && o.paymentStatus === 'PROOF_SUBMITTED') return <Banner tone="info"><b>We’re checking your payment.</b> You’ll get an email as soon as it’s verified.</Banner>;
  if (o.paymentStatus === 'REJECTED') return <Banner tone="bad"><b>We couldn’t verify your payment.</b> {o.paymentNote && <>Reason: {o.paymentNote}.</>} Please upload a new screenshot below.</Banner>;
  if (o.status === 'OUT_FOR_DELIVERY') return <Banner tone="info"><b>Your order is on its way.</b> {o.courier && <>Courier: {o.courier}. </>}{o.trackingNumber && <>Tracking number: {o.trackingNumber}. </>}{o.paymentMethod === 'COD' && o.paymentStatus === 'UNPAID' && <>Please have {formatCurrency(o.totalCents)} in cash ready.</>}</Banner>;
  if (o.status === 'EXCHANGE_REQUESTED') return <Banner tone="warn"><b>Exchange requested.</b> We’ll be in touch shortly.</Banner>;
  if (o.status === 'EXCHANGED') return <Banner tone="info"><b>Your exchange is complete.</b></Banner>;
  if (o.paymentMethod === 'COD' && o.status === 'PLACED') return <Banner tone="info"><b>Order received.</b> Pay {formatCurrency(o.totalCents)} in cash on delivery.</Banner>;
  return null;
};

const ResubmitProof = ({ order }: { order: Order }) => {
  const qc = useQueryClient();
  const file = useRef<HTMLInputElement>(null);
  const [receipt, setReceipt] = useState('');
  const m = useMutation({
    mutationFn: () => orderService.resubmitProof(order.id, file.current!.files![0], receipt.trim() || undefined),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['order', order.id] }),
  });
  return (
    <section className="space-y-3 border border-line-soft p-5"><h2 className="font-serif text-lg font-extrabold">Upload a new payment screenshot</h2>
      <input ref={file} type="file" accept="image/jpeg,image/png,image/webp" className="block text-sm" />
      <Input label="Receipt number (optional)" value={receipt} onChange={(e) => setReceipt(e.target.value)} maxLength={60} />
      {m.isError && <p role="alert" className="text-2xs text-brand">{getErrorMessage(m.error)}</p>}
      <Button size="sm" loading={m.isPending} onClick={() => (file.current?.files?.[0] ? m.mutate() : alert('Choose a screenshot first.'))}>Upload</Button>
    </section>
  );
};

const ExchangeRequest = ({ order }: { order: Order }) => {
  const qc = useQueryClient();
  const [reason, setReason] = useState('');
  const m = useMutation({ mutationFn: () => orderService.requestExchange(order.id, reason.trim()), onSuccess: () => qc.invalidateQueries({ queryKey: ['order', order.id] }) });
  return (
    <section className="space-y-3 border border-line-soft p-5"><h2 className="font-serif text-lg font-extrabold">Need an exchange?</h2>
      <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} maxLength={500} aria-label="Reason for exchange" placeholder="Which item, and what size or colour would you like instead?" className="w-full border border-line p-3 text-sm" />
      {m.isError && <p role="alert" className="text-2xs text-brand">{getErrorMessage(m.error)}</p>}
      <Button size="sm" loading={m.isPending} disabled={reason.trim().length < 5} onClick={() => m.mutate()}>Request exchange</Button>
    </section>
  );
};

/** `interactive` = the logged-in owner (can upload / request). False for the public lookup by order number + email. */
export const OrderDetailView = ({ order, interactive = false }: { order: Order; interactive?: boolean }) => (
  <div className="space-y-6">
    {stateMessage(order)}
    <div className="grid gap-8 md:grid-cols-[1fr_280px]">
      <section className="border border-line-soft p-6"><h2 className="mb-3 font-serif text-lg font-extrabold">Order {order.orderNumber}</h2>
        <OrderItems order={order} /><div className="mt-4"><CartSummary cart={order} /></div>
        <p className="mt-4 text-2xs text-muted-foreground">Payment: {order.paymentMethod === 'PAYID' ? 'PayID' : 'Cash on delivery'} · {order.paymentStatus.replace(/_/g, ' ').toLowerCase()}{order.payidReceiptNumber ? ` · receipt ${order.payidReceiptNumber}` : ''}</p></section>
      <section className="border border-line-soft p-6"><h2 className="mb-4 font-serif text-lg font-extrabold">Status</h2><OrderTimeline steps={order.timeline} /></section>
    </div>
    {interactive && order.canResubmitProof && <ResubmitProof order={order} />}
    {interactive && order.canRequestExchange && <ExchangeRequest order={order} />}
  </div>
);
