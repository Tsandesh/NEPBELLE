import { Link } from 'react-router-dom';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useUiStore } from '@/store/uiStore';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useCart } from '../hooks/useCart';
import { CartLine } from './CartLine';
import { CartSummary } from './CartSummary';

export const CartDrawer = () => {
  const { bagOpen, setBagOpen } = useUiStore();
  const { isAuthenticated } = useAuth();
  const { data: cart, isLoading } = useCart();
  const close = () => setBagOpen(false);
  return (
    <Dialog open={bagOpen} onOpenChange={setBagOpen}>
      <DialogContent side="right">
        <div className="border-b border-line px-6 py-5"><DialogTitle className="font-serif text-xl font-extrabold">My Bag {cart ? `(${cart.itemCount})` : ''}</DialogTitle>
          <DialogDescription className="sr-only">Items in your shopping bag</DialogDescription></div>
        <div className="flex-1 overflow-y-auto px-6">
          {!isAuthenticated ? (
            <p className="py-10 text-center text-muted-foreground">Sign in to view your bag.</p>
          ) : isLoading ? <div className="space-y-4 py-4">{[0, 1].map((i) => <Skeleton key={i} className="h-[120px] w-full" />)}</div>
          : !cart?.items.length ? <p className="py-10 text-center text-muted-foreground">Your bag is empty.</p>
          : <ul className="divide-y divide-line">{cart.items.map((i) => <CartLine key={i.id} item={i} />)}</ul>}
        </div>
        <div className="space-y-4 border-t border-line p-6">
          {cart && cart.items.length > 0 && <CartSummary cart={cart} />}
          {isAuthenticated ? (
            <div className="grid gap-3">
              <Button asChild size="block" disabled={!cart?.items.length}><Link to="/checkout/shipping" onClick={close}>Checkout</Link></Button>
              <Button asChild variant="secondary" size="block"><Link to="/cart" onClick={close}>View bag</Link></Button>
            </div>
          ) : <Button asChild size="block"><Link to="/login" onClick={close}>Sign in</Link></Button>}
        </div>
      </DialogContent>
    </Dialog>
  );
};
