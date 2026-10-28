import { useCart } from '@/features/cart/hooks/useCart';
import { CartSummary } from '@/features/cart/components/CartSummary';
import { Skeleton } from '@/components/ui/skeleton';

export const OrderSummaryPanel = () => {
  const { data: cart, isLoading } = useCart();
  if (isLoading || !cart) return <Skeleton className="h-64 w-full" />;
  return (
    <aside className="h-fit space-y-4 border border-line-soft bg-white p-6">
      <h2 className="font-serif text-xl font-extrabold">Order summary</h2>
      <ul className="space-y-3">{cart.items.map((i) => (
        <li key={i.id} className="flex gap-3 text-sm"><img src={i.product.image ?? ''} alt="" className="h-[72px] w-[54px] bg-thumb object-cover" />
          <div className="flex-1"><p className="font-serif font-extrabold leading-[18px]">{i.product.name}</p><p className="text-2xs text-muted-foreground">Size {i.size} · Qty {i.quantity}</p></div></li>))}</ul>
      <CartSummary cart={cart} />
    </aside>
  );
};
