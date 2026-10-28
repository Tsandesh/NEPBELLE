import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/common/EmptyState';
import { useOrders } from '@/features/orders/hooks/useOrders';
import { formatCurrency, formatDate } from '@/utils/format';

// Figma 04.2 Order history
export default function OrderHistoryPage() {
  const { data, isLoading } = useOrders();
  if (isLoading) return <Skeleton className="h-64" />;
  if (!data?.length) return <EmptyState title="No orders yet" action={<Button asChild><Link to="/shop">Start shopping</Link></Button>} />;
  return (
    <div className="space-y-4"><h1 className="font-serif text-display">Order history</h1>
      {data.map((o) => (
        <article key={o.id} className="flex flex-wrap items-center justify-between gap-4 border border-line-soft p-5">
          <div><p className="font-serif font-extrabold">{o.orderNumber}</p><p className="text-2xs text-muted-foreground">{formatDate(o.placedAt)} · {o.items.length} item(s) · {o.status.replace(/_/g, ' ').toLowerCase()}</p></div>
          <div className="flex items-center gap-4"><span>{formatCurrency(o.totalCents)}</span><Button asChild variant="secondary" size="sm"><Link to={`/orders/${o.id}/tracking`}>Track</Link></Button></div>
        </article>))}</div>
  );
}
