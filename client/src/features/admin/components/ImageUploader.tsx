import { useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Loader2, Plus, X } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { getErrorMessage } from '@/services/api';

import { cn } from '@/utils/cn';
import { adminService } from '../services/adminService';
import { assetUrl } from '@/utils/assets';

const TYPES = ['image/jpeg', 'image/png', 'image/webp'];

interface Props { label?: string; value: string[]; onChange: (urls: string[]) => void; max?: number; tile?: string; error?: string }

export const ImageUploader = ({ label, value, onChange, max = 1, tile = 'h-[120px] w-[90px]', error }: Props) => {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState<string>();

  const pick = async (files: FileList | null) => {
    if (!files?.length) return;
    setLocalError(undefined);
    const list = max === 1 ? [files[0]] : Array.from(files).slice(0, max - value.length);
    for (const f of list) {
      if (!TYPES.includes(f.type)) return setLocalError('Use a JPG, PNG or WebP image.');
      if (f.size > 5 * 1024 * 1024) return setLocalError('Each image must be 5 MB or smaller.');
    }
    setBusy(true);
    try {
      const urls: string[] = [];
      for (const f of list) urls.push(await adminService.upload(f));
      onChange(max === 1 ? urls : [...value, ...urls]);
    } catch (e) { setLocalError(getErrorMessage(e, 'Upload failed.')); }
    finally { setBusy(false); if (input.current) input.current.value = ''; }
  };

  const move = (i: number, d: number) => { const n = [...value]; [n[i], n[i + d]] = [n[i + d], n[i]]; onChange(n); };
  const shownError = localError ?? error;

  return (
    <div>
      {label && <Label>{label}</Label>}
      <div className="mt-1.5 flex flex-wrap gap-3">
        {value.map((url, i) => (
          <div key={`${url}-${i}`} className={cn('relative bg-thumb', tile)}>
            <img src={assetUrl(url)} alt="" className="size-full object-cover" />
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-black/60 px-1 py-0.5 text-white">
              {max > 1 ? <button type="button" aria-label="Move left" disabled={i === 0} onClick={() => move(i, -1)} className="disabled:opacity-30"><ArrowLeft className="size-4" /></button> : <span />}
              <button type="button" aria-label="Remove image" onClick={() => onChange(value.filter((_, j) => j !== i))}><X className="size-4" /></button>
              {max > 1 ? <button type="button" aria-label="Move right" disabled={i === value.length - 1} onClick={() => move(i, 1)} className="disabled:opacity-30"><ArrowRight className="size-4" /></button> : <span />}
            </div>
          </div>
        ))}
        {(value.length < max || max === 1) && (
          <button type="button" onClick={() => input.current?.click()} disabled={busy}
            className={cn('flex flex-col items-center justify-center gap-1 border border-dashed border-line text-2xs text-muted-foreground hover:border-brand hover:text-brand disabled:opacity-60', tile)}>
            {busy ? <Loader2 className="size-5 animate-spin" /> : <Plus className="size-5" />}
            {max === 1 && value.length ? 'Replace' : 'Upload'}
          </button>
        )}
      </div>
      <input ref={input} type="file" accept={TYPES.join(',')} multiple={max > 1} hidden onChange={(e) => pick(e.target.files)} />
      {shownError && <p role="alert" className="mt-1 text-2xs text-brand">{shownError}</p>}
    </div>
  );
};