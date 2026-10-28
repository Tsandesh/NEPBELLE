import { ToggleGroup, SizeToggleItem } from '@/components/ui/toggle-group';

export const SizeSelector = ({ sizes, value, onChange }: { sizes: { size: string; inStock: boolean }[]; value?: string; onChange: (s?: string) => void }) => (
  <ToggleGroup type="single" value={value ?? ''} onValueChange={(v) => onChange(v || undefined)} className="flex flex-wrap gap-2" aria-label="Size">
    {sizes.map(({ size, inStock }) => <SizeToggleItem key={size} value={size} disabled={!inStock} aria-label={`Size ${size}${inStock ? '' : ', out of stock'}`}>{size}</SizeToggleItem>)}
  </ToggleGroup>
);
