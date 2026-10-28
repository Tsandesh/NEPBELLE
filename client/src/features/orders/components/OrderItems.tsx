import type { Order } from '../types';
import { formatCurrency } from '@/utils/format';

export const OrderItems = ({ order }: { order: Order }) => (
  <ul className="divide-y divide-line">{order.items.map((i) => (
    <li key={i.id} className="flex gap-4 py-3"><img src={i.productImage} alt="" className="h-[90px] w-[68px] bg-thumb object-cover" />
      <div className="flex-1 text-sm"><p className="font-serif font-extrabold">{i.productName}</p><p className="text-2xs text-muted-foreground">Size {i.size} · {i.colourName} · Qty {i.quantity}</p></div>
      <p className="text-sm">{formatCurrency(i.unitPriceCents * i.quantity)}</p></li>))}</ul>
);
