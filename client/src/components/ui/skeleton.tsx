import { cn } from '@/utils/cn';

export const Skeleton = ({ className }: { className?: string }) => (
  <div aria-hidden className={cn('relative overflow-hidden bg-thumb', className)}>
    <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 to-transparent" />
  </div>
);
