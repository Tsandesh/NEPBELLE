import { Check } from 'lucide-react';
import { cn } from '@/utils/cn';
import { formatDate } from '@/utils/format';
import type { Order } from '../types';

const LABEL: Record<string, string> = { PLACED: 'Order placed', PACKED: 'Packed', SHIPPED: 'Shipped', OUT_FOR_DELIVERY: 'Out for delivery', DELIVERED: 'Delivered' };

export const OrderTimeline = ({ steps }: { steps: Order['timeline'] }) => (
  <ol className="space-y-5">{steps.map((s) => (
    <li key={s.status} className="flex items-start gap-3">
      <span className={cn('mt-0.5 flex size-5 items-center justify-center rounded-full border', s.done ? 'border-brand bg-brand text-white' : 'border-line')}>{s.done && <Check className="size-3" strokeWidth={3} />}</span>
      <div><p className={cn('font-serif font-extrabold', !s.done && 'text-subtle')}>{LABEL[s.status]}</p>{s.at && <p className="text-2xs text-muted-foreground">{formatDate(s.at)}</p>}</div>
    </li>))}</ol>
);
