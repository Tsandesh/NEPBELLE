import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { getErrorMessage } from '@/services/api';
import { formatCurrency, formatDate } from '@/utils/format';
import { useAddNote, useAdminOrder, useChangeStatus, usePaymentAction } from '@/features/admin/hooks/useAdminOrders';
import { ProofImage } from '@/features/admin/components/ProofImage';
import { StatusBadge } from '@/features/admin/components/StatusBadge';
import { STATUS_LABEL } from '@/features/admin/utils/labels';
import { waLink, waMessage } from '@/features/admin/utils/whatsapp';
import type { AdminOrderDetail } from '@/features/admin/types/orders';

const box = 'space-y-3 border border-line-soft bg-white p-5';
const area = 'w-full border border-line p-3 text-sm';

const nextLabel = (from: string, to: string) =>
  from === 'EXCHANGE_REQUESTED' && to === 'DELIVERED' ? 'Decline exchange (back to Delivered)' : STATUS_LABEL[to];

const PaymentPanel = ({ o }: { o: AdminOrderDetail }) => {
  const pay = usePaymentAction(o.id);
  const [reason, setReason] = useState('');
  const [rejecting, setRejecting] = useState(false);
  return (
    <section className={box}>
      <div className="flex items-center justify-between"><h2 className="font-serif text-lg font-extrabold">Payment · {o.paymentMethod === 'PAYID' ? 'PayID' : 'Cash on delivery'}</h2><StatusBadge kind="payment" value={o.paymentStatus} /></div>

      {o.paymentMethod === 'PAYID' && (
        <>
          <p className="text-sm">Expected: <b>{formatCurrency(o.totalCents)}</b> · Reference: <b>{o.orderNumber}</b>{o.payidReceiptNumber && <> · Customer’s receipt no.: <b>{o.payidReceiptNumber}</b></>}</p>
          {o.duplicateReceipt.length > 0 && <p role="alert" className="border border-brand bg-brand-tint p-3 text-sm"><b>Warning:</b> this receipt number was also used on {o.duplicateReceipt.join(', ')}.</p>}
          {o.hasProof ? <ProofImage orderId={o.id} /> : <p className="text-sm text-muted-foreground">No screenshot on file.</p>}
          <p className="text-2xs text-muted-foreground">A screenshot can be faked. Before verifying, confirm in <b>your own bank app</b> that the money has arrived, for the right amount, with this reference.</p>
        </>
      )}
      {o.paymentMethod === 'COD' && <p className="text-sm">Collect <b>{formatCurrency(o.totalCents)}</b> in cash on delivery.</p>}
      {o.paymentNote && <p className="text-sm">Note: {o.paymentNote}</p>}
      {pay.isError && <p role="alert" className="text-2xs text-brand">{getErrorMessage(pay.error)}</p>}

      <div className="flex flex-wrap gap-3">
        {o.paymentStatus === 'PROOF_SUBMITTED' && <>
          <Button size="sm" loading={pay.isPending} onClick={() => confirm('Have you checked your bank app and the money has arrived?') && pay.mutate({ action: 'VERIFY' })}>Verify payment{o.status === 'PLACED' ? ' & confirm order' : ''}</Button>
          <Button size="sm" variant="secondary" onClick={() => setRejecting((v) => !v)}>Reject…</Button></>}
        {o.paymentMethod === 'COD' && o.paymentStatus === 'UNPAID' && ['OUT_FOR_DELIVERY', 'DELIVERED', 'EXCHANGE_REQUESTED', 'EXCHANGED'].includes(o.status) &&
          <Button size="sm" loading={pay.isPending} onClick={() => pay.mutate({ action: 'MARK_COLLECTED' })}>Mark cash collected</Button>}
        {o.paymentStatus === 'REFUND_DUE' &&
          <Button size="sm" loading={pay.isPending} onClick={() => confirm('Have you sent the refund (or confirmed no money was received)?') && pay.mutate({ action: 'MARK_REFUNDED', note: reason || undefined })}>Mark refunded</Button>}
      </div>
      {o.paymentStatus === 'REFUND_DUE' && <p className="text-2xs text-muted-foreground">Refund AU${(o.totalCents / 100).toFixed(2)} to the customer’s bank. If you never received the money, mark it refunded with a note saying so.</p>}
      {rejecting && (
        <div className="space-y-2"><textarea className={area} rows={2} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason shown to the customer, e.g. amount didn’t match" aria-label="Rejection reason" />
          <Button size="sm" loading={pay.isPending} disabled={reason.trim().length < 3} onClick={() => pay.mutate({ action: 'REJECT', note: reason }, { onSuccess: () => { setRejecting(false); setReason(''); } })}>Send rejection</Button></div>)}
    </section>
  );
};

const StatusPanel = ({ o }: { o: AdminOrderDetail }) => {
  const change = useChangeStatus(o.id);
  const [to, setTo] = useState('');
  const [note, setNote] = useState(''); const [courier, setCourier] = useState(''); const [tracking, setTracking] = useState(''); const [cash, setCash] = useState(false);
  const needsNote = to === 'CANCELLED' || to === 'EXCHANGE_REQUESTED' || (o.status === 'EXCHANGE_REQUESTED' && to === 'DELIVERED');
  const cashDue = to === 'DELIVERED' && o.paymentMethod === 'COD' && o.paymentStatus === 'UNPAID' && o.status === 'OUT_FOR_DELIVERY';
  const blocked = to === 'CONFIRMED' && o.paymentMethod === 'PAYID' && o.paymentStatus !== 'PAID';
  const ready = !!to && !blocked && (!needsNote || note.trim().length >= 3) && (!cashDue || cash);

  if (!o.allowedNext.length) return <section className={box}><h2 className="font-serif text-lg font-extrabold">Status</h2><p className="text-sm text-muted-foreground">This order is {STATUS_LABEL[o.status].toLowerCase()}. No further changes are possible.</p></section>;
  return (
    <section className={box}>
      <h2 className="font-serif text-lg font-extrabold">Move this order forward</h2>
      <select aria-label="New status" className="h-11 w-full border border-line bg-white px-3 text-sm" value={to} onChange={(e) => { setTo(e.target.value); setNote(''); setCash(false); }}>
        <option value="">Choose the next step…</option>{o.allowedNext.map((s) => <option key={s} value={s}>{nextLabel(o.status, s)}</option>)}</select>
      {blocked && <p role="alert" className="text-2xs text-brand">Verify the PayID payment first (see the Payment box).</p>}
      {to === 'OUT_FOR_DELIVERY' && <div className="grid gap-3 md:grid-cols-2"><Input label="Courier (optional)" value={courier} onChange={(e) => setCourier(e.target.value)} /><Input label="Tracking number (optional)" value={tracking} onChange={(e) => setTracking(e.target.value)} /></div>}
      {cashDue && <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={cash} onChange={(e) => setCash(e.target.checked)} className="accent-[var(--brand)]" /> I collected {formatCurrency(o.totalCents)} in cash</label>}
      {(needsNote || to === 'PACKED' || to === 'EXCHANGED') && <textarea className={area} rows={2} value={note} onChange={(e) => setNote(e.target.value)} aria-label="Note" placeholder={needsNote ? 'Reason (required, shown to the customer)' : 'Note (optional)'} />}
      {to && <p className="text-2xs text-muted-foreground">{['CONFIRMED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'EXCHANGE_REQUESTED', 'EXCHANGED'].includes(to) || (o.status === 'EXCHANGE_REQUESTED' && to === 'DELIVERED') ? 'The customer will be emailed.' : 'The customer will not be emailed for this step.'}</p>}
      {change.isError && <p role="alert" className="text-2xs text-brand">{getErrorMessage(change.error)}</p>}
      <Button size="sm" disabled={!ready} loading={change.isPending}
        onClick={() => change.mutate({ status: to, note: note.trim() || undefined, courier: courier.trim() || undefined, trackingNumber: tracking.trim() || undefined, cashCollected: cashDue ? cash : undefined }, { onSuccess: () => { setTo(''); setNote(''); setCourier(''); setTracking(''); setCash(false); } })}>Apply</Button>
    </section>
  );
};

export default function AdminOrderDetailPage() {
  const { id } = useParams();
  const { data: o, isLoading, isError } = useAdminOrder(id);
  const addNote = useAddNote(id ?? '');
  const [internal, setInternal] = useState('');
  if (isLoading) return <Skeleton className="h-96" />;
  if (isError || !o) return <p role="alert" className="text-brand">Order not found. <Link to="/admin/orders" className="underline">Back to orders</Link></p>;
  const a = o.shippingAddress;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><Link to="/admin/orders" className="text-2xs underline">← All orders</Link><h1 className="font-serif text-display">{o.orderNumber}</h1><p className="text-muted-foreground">Placed {formatDate(o.placedAt)}</p></div>
        <div className="flex items-center gap-2"><StatusBadge value={o.status} /><StatusBadge kind="payment" value={o.paymentStatus} /></div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <section className={box}><h2 className="font-serif text-lg font-extrabold">Items</h2>
            <ul className="divide-y divide-line-soft">{o.items.map((i) => (
              <li key={i.id} className="flex gap-3 py-3"><img src={i.productImage} alt="" className="h-[72px] w-[54px] bg-thumb object-cover" />
                <div className="flex-1 text-sm"><p className="font-serif font-extrabold">{i.productName}</p><p className="text-2xs text-muted-foreground">Size {i.size} · {i.colourName} · Qty {i.quantity}</p></div>
                <p className="text-sm">{formatCurrency(i.unitPriceCents * i.quantity)}</p></li>))}</ul>
            <dl className="space-y-1 text-sm"><div className="flex justify-between"><dt>Subtotal</dt><dd>{formatCurrency(o.subtotalCents)}</dd></div>
              <div className="flex justify-between"><dt>Shipping</dt><dd>{o.shippingCents ? formatCurrency(o.shippingCents) : 'Free'}</dd></div>
              <div className="flex justify-between font-extrabold"><dt>Total</dt><dd>{formatCurrency(o.totalCents)}</dd></div></dl></section>
          <PaymentPanel o={o} />
          <section className={box}><h2 className="font-serif text-lg font-extrabold">History</h2>
            <ol className="space-y-2 text-sm">{o.events.map((e) => (
              <li key={e.id} className="flex flex-wrap gap-x-2"><span className="text-muted-foreground">{new Date(e.createdAt).toLocaleString('en-AU')}</span>
                <b>{e.kind === 'STATUS' ? STATUS_LABEL[e.status] : e.kind === 'PAYMENT' ? 'Payment' : 'Note'}</b>{e.note && <span>— {e.note}</span>}<span className="text-2xs text-muted-foreground">({e.actor})</span></li>))}</ol>
            <div className="flex gap-2"><input className={`${area} h-10`} value={internal} onChange={(e) => setInternal(e.target.value)} placeholder="Add an internal note (not shown to the customer)" aria-label="Internal note" />
              <Button size="sm" variant="secondary" loading={addNote.isPending} disabled={!internal.trim()} onClick={() => addNote.mutate(internal.trim(), { onSuccess: () => setInternal('') })}>Add</Button></div></section>
        </div>

        <div className="space-y-6">
          <StatusPanel o={o} />
          <section className={box}><h2 className="font-serif text-lg font-extrabold">Customer</h2>
            <p className="text-sm"><b>{o.customerName}</b><br />{a.line1}{a.line2 ? `, ${a.line2}` : ''}<br />{a.city} {a.state} {a.postcode}</p>
            <p className="text-sm"><a className="underline" href={`tel:${o.phone}`}>{o.phone}</a><br /><a className="underline" href={`mailto:${o.email}`}>{o.email}</a></p>
            <Button asChild size="sm" variant="secondary"><a href={waLink(o.phone, waMessage(o))} target="_blank" rel="noreferrer">Message on WhatsApp</a></Button>
            <p className="text-2xs text-muted-foreground">Opens WhatsApp with a message ready for the order’s current status. You press send.</p></section>
          {(o.courier || o.trackingNumber) && <section className={box}><h2 className="font-serif text-lg font-extrabold">Delivery</h2><p className="text-sm">Courier: {o.courier ?? '—'}<br />Tracking: {o.trackingNumber ?? '—'}</p></section>}
          <section className={box}><h2 className="font-serif text-lg font-extrabold">Notifications sent</h2>
            <ul className="space-y-1 text-2xs">{o.notifications.map((n) => (
              <li key={n.id}><b>{n.channel}</b> · {n.event.replace(/_/g, ' ').toLowerCase()} · <span className={n.status === 'FAILED' ? 'text-brand' : ''}>{n.status.toLowerCase()}</span>{n.lastError && <span className="text-brand"> ({n.lastError})</span>}</li>))}
              {!o.notifications.length && <li className="text-muted-foreground">None yet.</li>}</ul>
            <p className="text-2xs text-muted-foreground">Failed messages are retried automatically up to 5 times.</p></section>
        </div>
      </div>
    </div>
  );
}