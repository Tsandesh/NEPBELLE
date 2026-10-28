import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getErrorMessage } from '@/services/api';
import type { Banner } from '@/features/catalog/types';
import { useDeleteBanner, useSaveBanner } from '../hooks/useAdmin';
import { ImageUploader } from './ImageUploader';

interface Props { section: Banner['section']; banner?: Banner; showLabel?: boolean }

export const BannerEditor = ({ section, banner, showLabel }: Props) => {
  const blank = { imageUrl: '', alt: '', label: '', linkUrl: '', sortOrder: 0, isActive: true };
  const [f, setF] = useState(banner ? { imageUrl: banner.imageUrl, alt: banner.alt, label: banner.label ?? '', linkUrl: banner.linkUrl ?? '', sortOrder: banner.sortOrder, isActive: banner.isActive } : blank);
  const [err, setErr] = useState<string>();
  const save = useSaveBanner();
  const del = useDeleteBanner();
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((p) => ({ ...p, [k]: v }));

  const submit = () => {
    setErr(undefined);
    if (!f.imageUrl) return setErr('Upload an image first.');
    save.mutate(
      { id: banner?.id, body: { section, imageUrl: f.imageUrl, alt: f.alt, label: f.label || null, linkUrl: f.linkUrl || null, sortOrder: Number(f.sortOrder) || 0, isActive: f.isActive } },
      { onSuccess: () => { if (!banner) setF(blank); }, onError: (e) => setErr(getErrorMessage(e)) },
    );
  };

  return (
    <div className="grid gap-4 border border-line-soft bg-white p-4 md:grid-cols-[200px_1fr]">
      <ImageUploader value={f.imageUrl ? [f.imageUrl] : []} onChange={(u) => set('imageUrl', u[0] ?? '')} tile="h-[120px] w-[180px]" />
      <div className="space-y-3">
        <div className="grid gap-3 md:grid-cols-2">
          <Input label="Alt text (accessibility)" value={f.alt} onChange={(e) => set('alt', e.target.value)} />
          {showLabel && <Input label="Label" value={f.label} onChange={(e) => set('label', e.target.value)} />}
          <Input label="Link (e.g. /shop?colours=Green)" value={f.linkUrl} onChange={(e) => set('linkUrl', e.target.value)} />
          <Input label="Order" type="number" min={0} value={f.sortOrder} onChange={(e) => set('sortOrder', Number(e.target.value))} />
        </div>
        <div className="flex items-center gap-2.5">
          <Checkbox id={`active-${banner?.id ?? section}`} checked={f.isActive} onCheckedChange={(c) => set('isActive', c === true)} />
          <Label htmlFor={`active-${banner?.id ?? section}`} className="font-sans font-normal">Visible on the storefront</Label>
        </div>
        {err && <p role="alert" className="text-2xs text-brand">{err}</p>}
        <div className="flex gap-3">
          <Button size="sm" loading={save.isPending} onClick={submit}>{banner ? 'Save changes' : 'Add'}</Button>
          {banner && <Button size="sm" variant="secondary" loading={del.isPending} onClick={() => confirm('Delete this item?') && del.mutate(banner.id)}>Delete</Button>}
        </div>
      </div>
    </div>
  );
};