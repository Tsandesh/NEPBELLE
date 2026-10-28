import { useEffect, useMemo, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { animate, motion, useMotionValue } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Product } from '@/features/catalog/types';
import { ProductCard, ProductCardSkeleton } from './ProductCard';

const CARD = 245;
const GAP = 10;
const STEP = CARD + GAP;

/** Infinite carousel: left/right arrows never disable, cards wrap around. Also supports swipe/drag. */
export const ProductCarousel = ({ products, loading }: { products?: Product[]; loading?: boolean }) => {
  const items = products ?? [];
  const len = items.length;
  const [offset, setOffset] = useState(0); // unbounded; wrapped with modulo when reading
  const [width, setWidth] = useState(0);
  const viewport = useRef<HTMLDivElement>(null);
  const busy = useRef(false);
  const x = useMotionValue(0);

  useEffect(() => {
    const el = viewport.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setWidth(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => { setOffset(0); x.set(0); }, [products, x]);

  // loop only when there are more cards than fit
  const looping = len > 0 && len * STEP - GAP > width;
  const slots = Math.ceil(width / STEP) + 2; // visible + one hidden on each side

  const visible = useMemo(() => {
    if (!looping) return items.map((p, i) => ({ p, key: `${p.id}-0`, i }));
    return Array.from({ length: slots }, (_, i) => {
      const a = offset + i; // absolute index
      const p = items[((a % len) + len) % len];
      return { p, key: `${p.id}-${Math.floor(a / len)}`, i };
    });
  }, [items, looping, offset, slots, len]);

  const next = async () => {
    if (busy.current || !looping) return;
    busy.current = true;
    await animate(x, -STEP, { duration: 0.35, ease: 'easeInOut' });
    flushSync(() => setOffset((o) => o + 1)); // rotate, then snap back with no visible jump
    x.set(0);
    busy.current = false;
  };

  const prev = async () => {
    if (busy.current || !looping) return;
    busy.current = true;
    flushSync(() => setOffset((o) => o - 1)); // new card appears hidden on the left…
    x.set(-STEP);
    await animate(x, 0, { duration: 0.35, ease: 'easeInOut' }); // …and slides in
    busy.current = false;
  };

  const arrow = 'absolute top-[146px] z-10 flex h-14 w-9 items-center justify-center bg-white shadow-nav hover:text-brand';

  return (
    <div className="relative">
      <div ref={viewport} className="overflow-hidden pb-4 pt-1">
        {loading ? (
          <div className="flex gap-2.5">{Array.from({ length: 5 }, (_, i) => <ProductCardSkeleton key={i} />)}</div>
        ) : (
          <motion.div
            style={{ x }} className="flex touch-pan-y gap-2.5"
            onPanEnd={(_, info) => { if (info.offset.x < -50) next(); else if (info.offset.x > 50) prev(); }}
            onDragStart={(e) => e.preventDefault()}
          >
            {visible.map(({ p, key }) => <div key={key} className="shrink-0"><ProductCard product={p} /></div>)}
          </motion.div>
        )}
      </div>
      {looping && !loading && (
        <>
          <button type="button" aria-label="Previous products" onClick={prev} className={`${arrow} -left-1.5`}><ChevronLeft className="size-4" /></button>
          <button type="button" aria-label="Next products" onClick={next} className={`${arrow} -right-1.5`}><ChevronRight className="size-4" /></button>
        </>
      )}
    </div>
  );
};