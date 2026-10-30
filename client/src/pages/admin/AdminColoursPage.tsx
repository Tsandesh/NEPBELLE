import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { getErrorMessage } from '@/services/api';
import { useAdminColours, useDeleteColour, useSaveColour } from '@/features/admin/hooks/useAdmin';
import type { AdminColour } from '@/features/admin/types';

const HEX = /^#[0-9a-fA-F]{6}$/;

const Row = ({ colour }: { colour?: AdminColour }) => {
  const [f, setF] = useState({ name: colour?.name ?? '', slug: colour?.slug ?? '', hex: colour?.hex ?? '#', sortOrder: colour?.sortOrder ?? 0 });
  const [err, setErr] = useState<string>();
  const save = useSaveColour(); const del = useDeleteColour();
  const used = colour?._count.variants ?? 0;

  const submit = () => {
    setErr(undefined);
    if (!f.name.trim()) return setErr('Enter a colour name.');
    if (!HEX.test(f.hex)) return setErr('Hex must look like #b51f2a.');
    save.mutate(
      { id: colour?.id, body: { name: f.name.trim(), slug: f.slug.trim() || undefined, hex: f.hex, sortOrder: Number(f.sortOrder) || 0 } },
      { onSuccess: () => { if (!colour) setF({ name: '', slug: '', hex: '#', sortOrder: 0 }); }, onError: (e) => setErr(getErrorMessage(e)) },
    );
  };

  return (
    <div className="flex flex-wrap items-start gap-4 border border-line-soft bg-white p-4">
      <span aria-hidden className="mt-[26px] size-11 shrink-0 border border-line" style={{ background: HEX.test(f.hex) ? f.hex : 'transparent' }} />
      <div className="grid flex-1 gap-3 md:grid-cols-4">
        <Input label="Name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
        <Input label="Hex (e.g. #b51f2a)" value={f.hex} onChange={(e) => setF({ ...f, hex: e.target.value })} />
        <Input label="Slug (used in filter URLs)" value={f.slug} onChange={(e) => setF({ ...f, slug: e.target.value })} placeholder="auto" />
        <Input label="Order" type="number" min={0} value={f.sortOrder} onChange={(e) => setF({ ...f, sortOrder: Number(e.target.value) })} />
      </div>
      <div className="w-full space-y-2">
        {colour && <p className="text-2xs text-muted-foreground">Used by {used} variant(s)</p>}
        {err && <p role="alert" className="text-2xs text-brand">{err}</p>}
        {del.isError && <p role="alert" className="text-2xs text-brand">{getErrorMessage(del.error)}</p>}
        <div className="flex gap-3">
          <Button size="sm" loading={save.isPending} onClick={submit}>{colour ? 'Save' : 'Add colour'}</Button>
          {colour && <Button size="sm" variant="secondary" disabled={used > 0} title={used > 0 ? 'In use by products' : undefined} loading={del.isPending}
            onClick={() => confirm(`Delete "${colour.name}"?`) && del.mutate(colour.id)}>Delete</Button>}
        </div>
      </div>
    </div>
  );
};

export default function AdminColoursPage() {
  const { data, isLoading } = useAdminColours();
  return (
    <div className="space-y-4">
      <h1 className="font-serif text-display">Colours</h1>
      <p className="text-2xs text-muted-foreground">Products pick from this list, and shoppers filter by it. Changing a colour here updates every product that uses it.</p>
      {isLoading ? <Skeleton className="h-64" /> : data?.map((c) => <Row key={c.id} colour={c} />)}
      <h2 className="pt-4 font-serif text-xl font-extrabold">New colour</h2>
      <Row />
    </div>
  );
}