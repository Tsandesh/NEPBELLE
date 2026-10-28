import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/cn';

const badgeVariants = cva('inline-flex items-start text-2xs text-white', {
  variants: {
    variant: {
      stock: 'bg-brand px-2.5 py-[7px]',          // "Only Few Left"
      sale: 'bg-brand/50 px-2 py-1.5',            // rgba(181,31,42,.5)
      overlay: 'bg-white/20 px-2 py-1.5',         // "Online Exclusive" / "Liva"
    },
  },
  defaultVariants: { variant: 'stock' },
});
export const Badge = ({ className, variant, ...props }: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) => (
  <span className={cn(badgeVariants({ variant }), className)} {...props} />
);
