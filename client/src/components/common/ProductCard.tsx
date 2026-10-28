import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Product } from '@/features/catalog/types';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Price } from './Price';
import { WishlistButton } from './WishlistButton';
import { useUiStore } from '@/store/uiStore';

/** Figma ProductCard (layouts 028–037): 245px wide, 327px thumb on #f4f4f4, serif name 14/18, price, badges. */
export const ProductCard = ({ product, quickView = false }: { product: Product; quickView?: boolean }) => {
  const setQuickView = useUiStore((s) => s.setQuickView);
  return (
    <motion.article whileHover={{ y: -2 }} transition={{ duration: 0.15 }} className="group relative w-[245px] shrink-0">
      <Link to={`/product/${product.slug}`} className="block">
        <div className="relative h-[327px] w-[245px] overflow-hidden bg-thumb">
          <img src={product.images[0]} alt={product.name} loading="lazy" className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
          {product.onSale && <Badge variant="sale" className="absolute left-0 top-0">Sale</Badge>}
          {product.badge && <Badge variant="overlay" className="absolute bottom-12 right-0">{product.badge}</Badge>}
        </div>
        <div className="flex flex-col items-start gap-1.5 py-[9px]">
          <h3 className="w-[200px] font-serif text-sm font-extrabold leading-[18px] text-ink">{product.name}</h3>
          <p className="text-sm leading-[18px] text-ink"><Price cents={product.priceCents} compareAt={product.compareAtCents} /></p>
          {product.stockLabel && <Badge variant="stock">{product.stockLabel}</Badge>}
        </div>
      </Link>
      <WishlistButton productId={product.id} className="absolute right-2 top-2" />
      {quickView && (
        <button type="button" onClick={() => setQuickView(product.slug)}
          className="absolute inset-x-0 top-[279px] hidden h-12 items-center justify-center bg-white/90 font-serif text-sm font-extrabold uppercase text-ink group-hover:flex">
          Quick view
        </button>
      )}
    </motion.article>
  );
};

export const ProductCardSkeleton = () => (
  <div className="w-[245px] shrink-0"><Skeleton className="h-[327px] w-[245px]" /><Skeleton className="mt-3 h-4 w-[200px]" /><Skeleton className="mt-2 h-4 w-20" /></div>
);
