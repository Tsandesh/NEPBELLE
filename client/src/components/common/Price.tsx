import { formatCurrency } from '@/utils/format';

export const Price = ({ cents, compareAt }: { cents: number; compareAt?: number | null }) => (
  <span className="inline-flex items-baseline gap-2">
    <span>{formatCurrency(cents)}</span>
    {compareAt && compareAt > cents && <s className="text-2xs text-subtle">{formatCurrency(compareAt)}</s>}
  </span>
);
