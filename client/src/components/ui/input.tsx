import * as React from 'react';
import { cn } from '@/utils/cn';
import { Label } from './label';

/** Figma Input: persistent label (serif 13px), 44px control, 1px #ddd border → focus 2px brand → error 1px brand + 12px helper. */
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> { label?: string; error?: string }

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, label, error, id, ...props }, ref) => {
  const uid = React.useId();
  const inputId = id ?? uid;
  return (
    <div className="flex flex-col gap-1.5">
      {label && <Label htmlFor={inputId}>{label}</Label>}
      <input
        ref={ref} id={inputId} aria-invalid={!!error} aria-describedby={error ? `${inputId}-err` : undefined}
        className={cn(
          'h-11 w-full border border-line bg-white px-3 text-sm text-ink outline-none placeholder:text-muted-foreground focus:border-2 focus:border-brand focus:px-[11px] disabled:bg-thumb disabled:text-subtle',
          error && 'border-brand', className,
        )}
        {...props}
      />
      {error && <p id={`${inputId}-err`} role="alert" className="text-2xs text-brand">{error}</p>}
    </div>
  );
});
Input.displayName = 'Input';
