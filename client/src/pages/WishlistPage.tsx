import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/common/EmptyState';
import { ProductCard } from '@/components/common/ProductCard';
import { useWishlist } from '@/features/wishlist/hooks/useWishlist';

// Figma 04.3 Wishlist
export default function WishlistPage() {
  const { data, isLoading } = useWishlist();
  if (isLoading) return <Skeleton className="h-64" />;
  if (!data?.length) return <EmptyState title="Your wishlist is empty" action={<Button asChild><Link to="/shop">Discover styles</Link></Button>}>Tap the heart on any product to save it here.</EmptyState>;
  return <div><h1 className="mb-6 font-serif text-display">Wishlist</h1><div className="grid grid-cols-2 justify-items-center gap-x-2.5 gap-y-6 lg:grid-cols-3 xl:grid-cols-4">{data.map((p) => <ProductCard key={p.id} product={p} quickView />)}</div></div>;
}
