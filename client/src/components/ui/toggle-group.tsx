import * as React from 'react';
import * as TG from '@radix-ui/react-toggle-group';
import { cn } from '@/utils/cn';

export const ToggleGroup = TG.Root;

/** Figma SizeToggle: 44×44, #ddd border; selected brand fill/white text; disabled #f4f4f4 + strikethrough #999. */
export const SizeToggleItem = React.forwardRef<React.ElementRef<typeof TG.Item>, React.ComponentPropsWithoutRef<typeof TG.Item>>(
  ({ className, ...props }, ref) => (
    <TG.Item
      ref={ref}
      className={cn('flex size-11 items-center justify-center border border-line bg-white font-serif text-sm font-extrabold text-ink hover:border-brand data-[state=on]:border-brand data-[state=on]:bg-brand data-[state=on]:text-white disabled:border-line disabled:bg-thumb disabled:text-subtle disabled:line-through disabled:hover:border-line', className)}
      {...props}
    />
  ),
);
SizeToggleItem.displayName = 'SizeToggleItem';
