import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion, type PanInfo } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface HeroSlide { src: string; alt: string }

const AUTO_MS = 5000;
const variants = {
  enter: (dir: number) => ({ x: dir >= 0 ? '100%' : '-100%' }),
  center: { x: 0 },
  exit: (dir: number) => ({ x: dir >= 0 ? '-100%' : '100%' }),
};

export const HeroCarousel = ({ slides }: { slides: HeroSlide[] }) => {
  const count = slides.length;
  const [[index, dir], setPage] = useState<[number, number]>([0, 0]);
  const [paused, setPaused] = useState(false);

  // circular: wraps from last → first and first → last
  const go = useCallback((d: number) => setPage(([i]) => [(i + d + count) % count, d]), [count]);
  const goTo = (n: number) => setPage(([i]) => [n, n >= i ? 1 : -1]);

  // auto-slide; timer restarts after every change (so manual clicks don't get cut short)
  useEffect(() => {
    if (count < 2 || paused) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = setTimeout(() => go(1), AUTO_MS);
    return () => clearTimeout(t);
  }, [index, count, paused, go]);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -80 || info.velocity.x < -500) go(1);
    else if (info.offset.x > 80 || info.velocity.x > 500) go(-1);
  };

  return (
    <section
      aria-roledescription="carousel" aria-label="Featured collections" tabIndex={0}
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}
      onKeyDown={(e) => { if (e.key === 'ArrowRight') go(1); if (e.key === 'ArrowLeft') go(-1); }}
      className="relative h-[420px] select-none overflow-hidden md:h-[650px]"
    >
      <AnimatePresence initial={false} custom={dir}>
        <motion.div
          key={index} custom={dir} variants={variants} initial="enter" animate="center" exit="exit"
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          drag={count > 1 ? 'x' : false} dragConstraints={{ left: 0, right: 0 }} dragElastic={0.15} onDragEnd={onDragEnd}
          role="group" aria-roledescription="slide" aria-label={`${index + 1} of ${count}`}
          className="absolute inset-0 cursor-grab active:cursor-grabbing"
        >
          <img src={slides[index].src} alt={slides[index].alt} draggable={false} className="size-full object-cover" />
        </motion.div>
      </AnimatePresence>

      {count > 1 && (
        <>
          <button type="button" aria-label="Previous slide" onClick={() => go(-1)}
            className="absolute left-4 top-1/2 z-10 flex h-14 w-9 -translate-y-1/2 items-center justify-center bg-white shadow-nav hover:text-brand">
            <ChevronLeft className="size-4" />
          </button>
          <button type="button" aria-label="Next slide" onClick={() => go(1)}
            className="absolute right-4 top-1/2 z-10 flex h-14 w-9 -translate-y-1/2 items-center justify-center bg-white shadow-nav hover:text-brand">
            <ChevronRight className="size-4" />
          </button>
          {/* Figma dots: 6px, active = brand red, inactive = white */}
          <div className="absolute inset-x-0 bottom-6 z-10 flex items-center justify-center">
            {slides.map((s, i) => (
              <button key={s.src + i} type="button" aria-label={`Go to slide ${i + 1}`} aria-current={i === index} onClick={() => goTo(i)} className="p-[5px]">
                <span className={cn('block size-1.5 rounded-full transition-colors', i === index ? 'bg-brand' : 'bg-white')} />
              </button>
            ))}
          </div>
        </>
      )}
    </section>
  );
};