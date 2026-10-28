import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/common/EmptyState';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useCart } from '@/features/cart/hooks/useCart';
import { CartLine } from '@/features/cart/components/CartLine';
import { CartSummary } from '@/features/cart/components/CartSummary';

// Figma 03.1 Cart summary + 03.5 Empty state
export default function CartPage() {
  const { isAuthenticated, bootstrapped } = useAuth();
  const { data: cart, isLoading } = useCart();
  if (!bootstrapped || (isAuthenticated && isLoading)) return <div className="container-nb py-12"><Skeleton className="h-64 w-full" /></div>;
  if (!isAuthenticated) return <EmptyState title="Sign in to view your bag" action={<Button asChild><Link to="/login" state={{ from: '/cart' }}>Sign in</Link></Button>} />;
  if (!cart?.items.length) return <EmptyState title="Your bag is empty" action={<Button asChild><Link to="/shop">Continue shopping</Link></Button>}>Looks like you haven’t added anything yet.</EmptyState>;
  return (
    <div className="container-nb grid gap-10 py-10 lg:grid-cols-[1fr_360px]">
      <section><h1 className="mb-4 font-serif text-display">My Bag</h1><ul className="divide-y divide-line border-y border-line">{cart.items.map((i) => <CartLine key={i.id} item={i} />)}</ul></section>
      <aside className="h-fit space-y-5 border border-line-soft bg-canvas p-6"><h2 className="font-serif text-xl font-extrabold">Order summary</h2><CartSummary cart={cart} />
        <Button asChild size="block"><Link to="/checkout/shipping">Checkout</Link></Button></aside>
    </div>
  );
}
