import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/common/EmptyState';
import { Button } from '@/components/ui/button';
import { useProduct, useProducts } from '@/features/catalog/hooks/useCatalog';
import { PurchasePanel } from '@/features/catalog/components/PurchasePanel';
import { ProductCarousel } from '@/components/common/ProductCarousel';
import { SizeChart } from '@/features/catalog/components/SizeChart';

// Figma 02.1 PDP + 02.4 Size chart
export default function ProductDetailPage() {
  const { slug } = useParams();
  const { data: product, isLoading, isError } = useProduct(slug);
  const related = useProducts({ category: product?.category.slug, limit: 8 });
  const [active, setActive] = useState(0);
  const [chart, setChart] = useState(false);

  if (isLoading) return <div className="container-nb grid gap-10 py-10 md:grid-cols-2"><Skeleton className="aspect-[3/4]" /><Skeleton className="h-96" /></div>;
  if (isError || !product) return <EmptyState title="Product not found" action={<Button asChild><Link to="/shop">Continue shopping</Link></Button>} />;

  return (
    <div className="container-nb py-8">
      <nav aria-label="Breadcrumb" className="mb-6 text-2xs text-muted-foreground"><Link to="/">Home</Link> / <Link to={`/shop/${product.category.slug}`}>{product.category.name}</Link> / <span className="text-ink">{product.name}</span></nav>
      <div className="grid gap-10 md:grid-cols-[1fr_440px]">
        <div className="grid gap-3 md:grid-cols-[80px_1fr]">
          <div className="order-2 flex gap-2 md:order-1 md:flex-col">{product.images.map((src, i) => <button key={src + i} onClick={() => setActive(i)} aria-label={`Image ${i + 1}`} className={`h-[100px] w-[75px] bg-thumb ${i === active ? 'ring-2 ring-brand' : ''}`}><img src={src} alt="" className="size-full object-cover" /></button>)}</div>
          <div className="order-1 aspect-[3/4] bg-thumb md:order-2"><img src={product.images[active]} alt={product.name} className="size-full object-cover" /></div>
        </div>
        <div className="space-y-8">
          <PurchasePanel product={product} onSizeChart={() => setChart(true)} />
          <section><h2 className="mb-2 font-serif text-lg font-extrabold">Product details</h2><p className="text-muted-foreground">{product.description}</p>{product.fabric && <p className="mt-2 text-muted-foreground">Fabric: {product.fabric}</p>}</section>
        </div>
      </div>
      <section className="mt-16"><h2 className="mb-6 text-center font-serif text-title uppercase">You may also like</h2><ProductCarousel products={related.data?.items.filter((p) => p.id !== product.id)} loading={related.isLoading} /></section>
      <Dialog open={chart} onOpenChange={setChart}><DialogContent className="p-6"><DialogTitle className="mb-4 font-serif text-xl font-extrabold">Size chart</DialogTitle><DialogDescription className="sr-only">Body measurements by size</DialogDescription><SizeChart /></DialogContent></Dialog>
    </div>
  );
}
