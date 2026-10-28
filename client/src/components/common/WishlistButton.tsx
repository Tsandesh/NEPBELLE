import { Heart } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useToggleWishlist } from '@/features/wishlist/hooks/useWishlist';

export const WishlistButton = ({ productId, className }: { productId: string; className?: string }) => {
  const { active, toggle, pending } = useToggleWishlist(productId);
  return (
    <button
      type="button" aria-pressed={active} aria-label={active ? 'Remove from wishlist' : 'Add to wishlist'} disabled={pending}
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(); }}
      className={cn('flex size-8 items-center justify-center bg-white/80 text-ink hover:text-brand', className)}
    >
      <Heart className={cn('size-[18px]', active && 'fill-brand text-brand')} />
    </button>
  );
};
