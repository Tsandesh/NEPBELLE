import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useParams } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { emailField } from '@/utils/validation';
import { getErrorMessage } from '@/services/api';
import { useOrder, useTrackOrder } from '@/features/orders/hooks/useOrders';
import { OrderTimeline } from '@/features/orders/components/OrderTimeline';
import { OrderItems } from '@/features/orders/components/OrderItems';
import type { Order } from '@/features/orders/types';

const schema = z.object({ orderNumber: z.string().trim().min(4, 'Enter your order number.'), email: emailField });

const Result = ({ o }: { o: Order }) => (
  <div className="grid gap-8 md:grid-cols-[1fr_280px]"><section className="border border-line-soft p-6"><h2 className="mb-3 font-serif text-lg font-extrabold">Order {o.orderNumber}</h2><OrderItems order={o} /></section>
    <section className="border border-line-soft p-6"><h2 className="mb-4 font-serif text-lg font-extrabold">Status</h2><OrderTimeline steps={o.timeline} /></section></div>
);

// Authenticated (/orders/:id/tracking) and public lookup (/track-order) share one page
export default function OrderTrackingPage() {
  const { id } = useParams();
  const mine = useOrder(id);
  const track = useTrackOrder();
  const f = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) });
  return (
    <div className="container-nb max-w-[960px] space-y-6 py-10"><h1 className="font-serif text-display">Track your order</h1>
      {id ? (mine.isLoading ? <Skeleton className="h-64" /> : mine.data ? <Result o={mine.data} /> : <p role="alert" className="text-brand">Order not found.</p>) : (
        <>
          <form noValidate onSubmit={f.handleSubmit((v) => track.mutate(v))} className="grid items-start gap-4 border border-line-soft bg-canvas p-6 md:grid-cols-[1fr_1fr_auto]">
            <Input label="Order number" error={f.formState.errors.orderNumber?.message} {...f.register('orderNumber')} />
            <Input label="Email" type="email" error={f.formState.errors.email?.message} {...f.register('email')} />
            <Button className="md:mt-[26px]" loading={track.isPending}>Track</Button>
          </form>
          {track.isError && <p role="alert" className="text-brand">{getErrorMessage(track.error)}</p>}
          {track.data && <Result o={track.data} />}
        </>)}
    </div>
  );
}
