import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useAdminOrders } from '@/features/admin/hooks/useAdminOrders';
import { StatusBadge } from '@/features/admin/components/StatusBadge';
import { PAYMENT_LABEL, STATUS_LABEL } from '@/features/admin/utils/labels';
import { formatCurrency, formatDate } from '@/utils/format';

const sel = 'h-11 border border-line bg-white px-3 text-sm';

export default function AdminOrdersPage() {
  const [sp, setSp] = useSearchParams();
  const f = { status: sp.get('status') ?? undefined, paymentStatus: sp.get('paymentStatus') ?? undefined, method: sp.get('method') ?? undefined, q: sp.get('q') ?? undefined, page: Number(sp.get('page') ?? 1) };
  const { data, isLoading } = useAdminOrders(f);
  const set = (k: string, v?: string) => { const n = new URLSearchParams(sp); v ? n.set(k, v) : n.delete(k); if (k !== 'page') n.delete('page'); setSp(n); };

  return (
    <div className="space-y-4">
      <h1 className="font-serif text-display">Orders</h1>
      <div className="grid gap-3 md:grid-cols-[1fr_auto_auto_auto]">
        <Input aria-label="Search orders" placeholder="Search order no., name, phone or email" value={f.q ?? ''} onChange={(e) => set('q', e.target.value || undefined)} />
        <select aria-label="Order status" className={sel} value={f.status ?? ''} onChange={(e) => set('status', e.target.value || undefined)}>
          <option value="">All statuses</option>{Object.entries(STATUS_LABEL).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
        <select aria-label="Payment status" className={sel} value={f.paymentStatus ?? ''} onChange={(e) => set('paymentStatus', e.target.value || undefined)}>
          <option value="">All payments</option>{Object.entries(PAYMENT_LABEL).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
        <select aria-label="Payment method" className={sel} value={f.method ?? ''} onChange={(e) => set('method', e.target.value || undefined)}>
          <option value="">COD + PayID</option><option value="COD">COD</option><option value="PAYID">PayID</option></select>
      </div>

      {isLoading ? <Skeleton className="h-64" /> : (
        <div className="overflow-x-auto border border-line-soft bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-canvas font-serif"><tr>{['Order', 'Placed', 'Customer', 'Total', 'Method', 'Payment', 'Status', ''].map((h) => <th key={h} className="px-3 py-3 font-extrabold">{h}</th>)}</tr></thead>
            <tbody>
              {data?.items.map((o) => (
                <tr key={o.id} className="border-t border-line-soft">
                  <td className="px-3 py-2 font-semibold">{o.orderNumber}</td>
                  <td className="px-3 py-2">{formatDate(o.placedAt)}</td>
                  <td className="px-3 py-2">{o.customerName}<br /><span className="text-2xs text-muted-foreground">{o.phone}</span></td>
                  <td className="px-3 py-2">{formatCurrency(o.totalCents)}</td>
                  <td className="px-3 py-2">{o.paymentMethod === 'PAYID' ? 'PayID' : 'COD'}</td>
                  <td className="px-3 py-2"><StatusBadge kind="payment" value={o.paymentStatus} /></td>
                  <td className="px-3 py-2"><StatusBadge value={o.status} /></td>
                  <td className="px-3 py-2 text-right"><Button asChild size="sm" variant="secondary"><Link to={`/admin/orders/${o.id}`}>Open</Link></Button></td>
                </tr>))}
              {!data?.items.length && <tr><td colSpan={8} className="px-3 py-10 text-center text-muted-foreground">No orders match.</td></tr>}
            </tbody>
          </table>
        </div>)}
      {data && data.meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button size="sm" variant="secondary" disabled={f.page <= 1} onClick={() => set('page', String(f.page - 1))}>Previous</Button>
          <span className="text-sm">Page {f.page} of {data.meta.totalPages}</span>
          <Button size="sm" variant="secondary" disabled={f.page >= data.meta.totalPages} onClick={() => set('page', String(f.page + 1))}>Next</Button>
        </div>)}
    </div>
  );
}