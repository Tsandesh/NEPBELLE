import { Link } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { useAdminOrders, useAdminSummary } from '@/features/admin/hooks/useAdminOrders';
import { StatusBadge } from '@/features/admin/components/StatusBadge';
import { formatCurrency } from '@/utils/format';

export default function AdminDashboardPage() {
  const { data: s, isLoading } = useAdminSummary();
  const latest = useAdminOrders({ page: 1 });
  if (isLoading || !s) return <Skeleton className="h-64" />;
  const by = (k: string) => s.byStatus[k] ?? 0;
  const cards = [
    ['New orders', by('PLACED'), '/admin/orders?status=PLACED', true],
    ['Payments to check', s.proofsToCheck, '/admin/orders?paymentStatus=PROOF_SUBMITTED', true],
    ['Exchange requests', by('EXCHANGE_REQUESTED'), '/admin/orders?status=EXCHANGE_REQUESTED', true],
    ['To pack', by('CONFIRMED'), '/admin/orders?status=CONFIRMED', false],
    ['Ready to send', by('PACKED'), '/admin/orders?status=PACKED', false],
    ['Out for delivery', by('OUT_FOR_DELIVERY'), '/admin/orders?status=OUT_FOR_DELIVERY', false],
    ['COD cash to collect', s.codToCollect, '/admin/orders?method=COD&paymentStatus=UNPAID', false],
    ['Refunds due', s.refundsDue, '/admin/orders?paymentStatus=REFUND_DUE', true],
  ] as const;
  return (
    <div className="space-y-8">
      <div><h1 className="font-serif text-display">Dashboard</h1><p className="text-muted-foreground">Paid revenue so far: <b>{formatCurrency(s.paidRevenueCents)}</b></p></div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {cards.map(([label, n, to, urgent]) => (
          <Link key={label} to={to} className={`border p-4 hover:border-brand ${urgent && n > 0 ? 'border-brand bg-brand-tint' : 'border-line-soft bg-white'}`}>
            <p className="font-serif text-3xl font-extrabold">{n}</p><p className="text-sm text-muted-foreground">{label}</p>
          </Link>))}
      </div>
      <section><h2 className="mb-3 font-serif text-xl font-extrabold">Latest orders</h2>
        <ul className="divide-y divide-line-soft border border-line-soft bg-white">
          {latest.data?.items.slice(0, 8).map((o) => (
            <li key={o.id}><Link to={`/admin/orders/${o.id}`} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 hover:bg-canvas">
              <span><b>{o.orderNumber}</b> · {o.customerName}</span><span className="flex items-center gap-2">{formatCurrency(o.totalCents)}<StatusBadge value={o.status} /></span></Link></li>))}
          {!latest.data?.items.length && <li className="px-4 py-8 text-center text-muted-foreground">No orders yet.</li>}
        </ul></section>
    </div>
  );
}