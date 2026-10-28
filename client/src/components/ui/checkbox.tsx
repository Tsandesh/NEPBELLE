import * as React from 'react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { Check } from 'lucide-react';
import { cn } from '@/utils/cn';

/** Figma Checkbox: 18px box, #666 border; hover brand-tint + brand border; checked brand fill; disabled #eee. */
export const Checkbox = React.forwardRef<React.ElementRef<typeof CheckboxPrimitive.Root>, React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>>(
  ({ className, ...props }, ref) => (
    <CheckboxPrimitive.Root
      ref={ref}
      className={cn('flex size-[18px] shrink-0 items-center justify-center border border-[#666] bg-white hover:border-brand hover:bg-brand-tint data-[state=checked]:border-brand data-[state=checked]:bg-brand data-[state=checked]:text-white disabled:border-line disabled:bg-disabled', className)}
      {...props}
    >
      <CheckboxPrimitive.Indicator><Check className="size-3" strokeWidth={3} /></CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  ),
);
Checkbox.displayName = 'Checkbox';
