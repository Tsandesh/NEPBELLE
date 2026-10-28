import { Link, useParams } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/common/EmptyState';
import { useOrder } from '@/features/orders/hooks/useOrders';
import { OrderItems } from '@/features/orders/components/OrderItems';
import { CartSummary } from '@/features/cart/components/CartSummary';

// Figma 03.4 Order confirmation / receipt
export default function OrderConfirmationPage() {
  const { id } = useParams();
  const { data: o, isLoading, isError } = useOrder(id);
  if (isLoading) return <div className="container-nb py-12"><Skeleton className="h-80" /></div>;
  if (isError || !o) return <EmptyState title="Order not found" action={<Button asChild><Link to="/account/orders">View orders</Link></Button>} />;
  return (
    <div className="container-nb max-w-[760px] space-y-6 py-12">
      <div className="flex flex-col items-center gap-2 text-center"><CheckCircle2 className="size-12 text-brand" /><h1 className="font-serif text-display">Thank you for your order</h1><p className="text-muted-foreground">Order <b>{o.orderNumber}</b> · a confirmation was sent to your email.</p></div>
      <section className="border border-line-soft p-6"><OrderItems order={o} /><div className="mt-4"><CartSummary cart={o} /></div></section>
      <section className="border border-line-soft p-6 text-sm"><h2 className="mb-1 font-serif text-lg font-extrabold">Shipping to</h2><p className="text-muted-foreground">{o.shippingAddress.fullName}<br />{o.shippingAddress.line1}{o.shippingAddress.line2 ? `, ${o.shippingAddress.line2}` : ''}<br />{o.shippingAddress.city} {o.shippingAddress.state} {o.shippingAddress.postcode}</p></section>
      <div className="flex justify-center gap-3"><Button asChild><Link to={`/orders/${o.id}/tracking`}>Track order</Link></Button><Button asChild variant="secondary"><Link to="/shop">Continue shopping</Link></Button></div>
    </div>
  );
}
