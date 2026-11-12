import { Link, useParams } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/common/EmptyState';
import { useOrder } from '@/features/orders/hooks/useOrders';
import { OrderDetailView } from '@/features/orders/components/OrderDetailView';

export default function OrderConfirmationPage() {
  const { id } = useParams();
  const { data: o, isLoading, isError } = useOrder(id);
  if (isLoading) return <div className="container-nb py-12"><Skeleton className="h-80" /></div>;
  if (isError || !o) return <EmptyState title="Order not found" action={<Button asChild><Link to="/account/orders">View orders</Link></Button>} />;
  return (
    <div className="container-nb max-w-[900px] space-y-6 py-12">
      <div className="flex flex-col items-center gap-2 text-center"><CheckCircle2 className="size-12 text-brand" /><h1 className="font-serif text-display">Thank you, we’ve received your order</h1>
        <p className="text-muted-foreground">Order <b>{o.orderNumber}</b> · we’ve emailed you a confirmation.</p></div>
      <OrderDetailView order={o} interactive />
      <div className="flex justify-center gap-3"><Button asChild><Link to={`/orders/${o.id}/tracking`}>Track order</Link></Button><Button asChild variant="secondary"><Link to="/shop">Continue shopping</Link></Button></div>
    </div>
  );
}
