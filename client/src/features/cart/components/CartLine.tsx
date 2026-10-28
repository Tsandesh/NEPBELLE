import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2 } from 'lucide-react';
import type { CartItem } from '../types';
import { formatCurrency } from '@/utils/format';
import { useRemoveCartItem, useUpdateCartItem } from '../hooks/useCart';

export const CartLine = ({ item }: { item: CartItem }) => {
  const update = useUpdateCartItem();
  const remove = useRemoveCartItem();
  const busy = update.isPending || remove.isPending;
  return (
    <li className="flex gap-4 py-4">
      <Link to={`/product/${item.product.slug}`} className="h-[120px] w-[90px] shrink-0 bg-thumb"><img src={item.product.image ?? ''} alt="" className="size-full object-cover" /></Link>
      <div className="flex flex-1 flex-col gap-1">
        <Link to={`/product/${item.product.slug}`} className="font-serif text-sm font-extrabold leading-[18px] text-ink">{item.product.name}</Link>
        <p className="text-2xs text-muted-foreground">Size {item.size} · {item.colour.name}</p>
        <p className="text-sm">{formatCurrency(item.unitPriceCents)}</p>
        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-center border border-line">
            <button aria-label="Decrease quantity" disabled={busy || item.quantity <= 1} onClick={() => update.mutate({ id: item.id, quantity: item.quantity - 1 })} className="flex size-8 items-center justify-center disabled:text-subtle"><Minus className="size-3.5" /></button>
            <span className="w-8 text-center text-sm" aria-live="polite">{item.quantity}</span>
            <button aria-label="Increase quantity" disabled={busy || item.quantity >= Math.min(10, item.stock)} onClick={() => update.mutate({ id: item.id, quantity: item.quantity + 1 })} className="flex size-8 items-center justify-center disabled:text-subtle"><Plus className="size-3.5" /></button>
          </div>
          <button aria-label={`Remove ${item.product.name}`} disabled={busy} onClick={() => remove.mutate(item.id)} className="text-muted-foreground hover:text-brand"><Trash2 className="size-4" /></button>
        </div>
      </div>
    </li>
  );
};
