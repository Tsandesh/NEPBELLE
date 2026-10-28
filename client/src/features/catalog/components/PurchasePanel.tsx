import { useMemo, useState } from 'react';
import type { Product } from '../types';
import { Price } from '@/components/common/Price';
import { SizeSelector } from '@/components/common/SizeSelector';
import { ColourSwatch } from '@/components/common/ColourSwatch';
import { Button } from '@/components/ui/button';
import { useAddToBag } from '@/features/cart/hooks/useCart';
import { getErrorMessage } from '@/services/api';
import { WishlistButton } from '@/components/common/WishlistButton';

export const PurchasePanel = ({ product, onSizeChart }: { product: Product; onSizeChart?: () => void }) => {
  const [colour, setColour] = useState(product.colours[0]?.name);
  const [size, setSize] = useState<string>();
  const [attempted, setAttempted] = useState(false);
  const { addToBag, isPending, error } = useAddToBag();

  const sizes = useMemo(() => product.sizes.map((s) => ({ size: s.size, inStock: product.variants.some((v) => v.size === s.size && v.colourName === colour && v.stock > 0) })), [product, colour]);
  const variant = product.variants.find((v) => v.size === size && v.colourName === colour);

  return (
    <div className="flex flex-col gap-5">
      <div><h1 className="font-serif text-[28px] font-extrabold leading-8 text-ink">{product.name}</h1>
        <p className="mt-2 text-base"><Price cents={product.priceCents} compareAt={product.compareAtCents} /></p>
        <p className="mt-1 text-2xs text-muted-foreground">Inclusive of all taxes</p></div>

      <div className="space-y-2"><p className="font-serif text-[13px] font-extrabold">Colour: <span className="font-sans font-normal">{colour}</span></p>
        <div className="flex gap-2">{product.colours.map((c) => <ColourSwatch key={c.name} {...c} selected={c.name === colour} onSelect={() => { setColour(c.name); setSize(undefined); }} />)}</div></div>

      <div className="space-y-2">
        <div className="flex items-center justify-between"><p className="font-serif text-[13px] font-extrabold">Select size</p>
          {onSizeChart && <button type="button" onClick={onSizeChart} className="text-2xs underline">Size chart</button>}</div>
        <SizeSelector sizes={sizes} value={size} onChange={(s) => { setSize(s); setAttempted(false); }} />
        {attempted && !size && <p role="alert" className="text-2xs text-brand">Select a size to continue.</p>}
      </div>

      <div className="flex gap-3">
        <Button className="flex-1" loading={isPending} onClick={() => { if (!variant) return setAttempted(true); addToBag(variant.id); }}>Add to bag</Button>
        <WishlistButton productId={product.id} className="size-12 border border-line" />
      </div>
      {error && <p role="alert" className="text-2xs text-brand">{getErrorMessage(error)}</p>}
    </div>
  );
};
