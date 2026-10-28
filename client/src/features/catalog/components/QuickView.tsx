import { Link } from 'react-router-dom';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useUiStore } from '@/store/uiStore';
import { useProduct } from '../hooks/useCatalog';
import { PurchasePanel } from './PurchasePanel';

export const QuickView = () => {
  const { quickViewSlug, setQuickView } = useUiStore();
  const { data: product, isLoading } = useProduct(quickViewSlug ?? undefined);
  return (
    <Dialog open={!!quickViewSlug} onOpenChange={(o) => !o && setQuickView(null)}>
      <DialogContent className="max-w-[760px] p-6">
        <DialogTitle className="sr-only">Quick view</DialogTitle><DialogDescription className="sr-only">Choose colour and size</DialogDescription>
        {isLoading || !product ? <Skeleton className="h-[420px] w-full" /> : (
          <div className="grid gap-6 md:grid-cols-[320px_1fr]">
            <img src={product.images[0]} alt={product.name} className="aspect-[3/4] w-full bg-thumb object-cover" />
            <div><PurchasePanel product={product} /><Link to={`/product/${product.slug}`} onClick={() => setQuickView(null)} className="mt-5 inline-block text-sm underline">View full details</Link></div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
