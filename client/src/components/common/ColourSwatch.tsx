import { Check } from 'lucide-react';
import { cn } from '@/utils/cn';

/** Figma ColourSwatch 34px: default = filled circle with white ring; selected = red ring + visible checkmark. */
export const ColourSwatch = ({ name, hex, selected, onSelect }: { name: string; hex: string; selected?: boolean; onSelect?: () => void }) => (
  <button type="button" onClick={onSelect} aria-pressed={selected} aria-label={name} title={name}
    className={cn('relative flex size-[34px] items-center justify-center rounded-full border-2 p-[3px]', selected ? 'border-brand' : 'border-line hover:border-brand-hover')}>
    <span className="flex size-full items-center justify-center rounded-full" style={{ background: hex }}>{selected && <Check className="size-3 text-white" strokeWidth={3} />}</span>
  </button>
);
