import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/cn';

/** Figma: 48px min-height, 20/12 padding, Abhaya Libre ExtraBold 14px uppercase.
 *  Primary: default #b51f2a / hover #a72f30 / pressed #8c1822 / disabled #eee.
 *  Secondary: white + red outline / hover tint / pressed tint-strong. */
const buttonVariants = cva(
  'inline-flex min-h-[48px] items-center justify-center gap-2 whitespace-nowrap px-5 py-3 font-serif text-sm font-extrabold uppercase tracking-wide transition-colors disabled:pointer-events-none disabled:border-line disabled:bg-disabled disabled:text-subtle',
  {
    variants: {
      variant: {
        primary: 'bg-brand text-white hover:bg-brand-hover active:bg-brand-pressed',
        secondary: 'border border-brand bg-white text-brand hover:border-brand-hover hover:bg-brand-tint hover:text-brand-hover active:border-brand-pressed active:bg-brand-tint-strong active:text-brand-pressed',
        ghost: 'min-h-0 px-0 py-0 text-ink hover:text-brand',
        link: 'min-h-0 px-0 py-0 normal-case underline underline-offset-4 text-ink hover:text-brand',
      },
      size: { default: '', sm: 'min-h-[40px] px-4 py-2', block: 'w-full' },
    },
    defaultVariants: { variant: 'primary', size: 'default' },
  },
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> { asChild?: boolean; loading?: boolean }

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild, loading, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp ref={ref} className={cn(buttonVariants({ variant, size }), className)} disabled={disabled || loading} {...props}>
        {loading ? 'Please wait…' : children}
      </Comp>
    );
  },
);
Button.displayName = 'Button';
export { buttonVariants };
