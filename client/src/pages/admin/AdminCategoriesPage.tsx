import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { getErrorMessage } from '@/services/api';
import { ImageUploader } from '@/features/admin/components/ImageUploader';
import { useAdminCategories, useDeleteCategory, useSaveCategory } from '@/features/admin/hooks/useAdmin';
import type { AdminCategory } from '@/features/admin/types';

const Row = ({ cat }: { cat?: AdminCategory }) => {
  const [f, setF] = useState({ name: cat?.name ?? '', slug: cat?.slug ?? '', imageUrl: cat?.imageUrl ?? '', sortOrder: cat?.sortOrder ?? 0 });
  const [err, setErr] = useState<string>();
  const save = useSaveCategory(); const del = useDeleteCategory();
  const submit = () => {
    setErr(undefined);
    if (!f.name.trim()) return setErr('Enter a name.');
    save.mutate({ id: cat?.id, body: { name: f.name, slug: f.slug || undefined, imageUrl: f.imageUrl || null, sortOrder: Number(f.sortOrder) || 0 } },
      { onSuccess: () => { if (!cat) setF({ name: '', slug: '', imageUrl: '', sortOrder: 0 }); }, onError: (e) => setErr(getErrorMessage(e)) });
  };
  return (
    <div className="grid gap-4 border border-line-soft bg-white p-4 md:grid-cols-[200px_1fr]">
      <ImageUploader value={f.imageUrl ? [f.imageUrl] : []} onChange={(u) => setF({ ...f, imageUrl: u[0] ?? '' })} tile="h-[120px] w-[180px]" />
      <div className="space-y-3">
        <div className="grid gap-3 md:grid-cols-3">
          <Input label="Name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
          <Input label="Slug (optional)" value={f.slug} onChange={(e) => setF({ ...f, slug: e.target.value })} />
          <Input label="Order" type="number" min={0} value={f.sortOrder} onChange={(e) => setF({ ...f, sortOrder: Number(e.target.value) })} />
        </div>
        {cat && <p className="text-2xs text-muted-foreground">{cat._count.products} product(s)</p>}
        {err && <p role="alert" className="text-2xs text-brand">{err}</p>}
        {del.isError && <p role="alert" className="text-2xs text-brand">{getErrorMessage(del.error)}</p>}
        <div className="flex gap-3">
          <Button size="sm" loading={save.isPending} onClick={submit}>{cat ? 'Save' : 'Add category'}</Button>
          {cat && <Button size="sm" variant="secondary" loading={del.isPending} onClick={() => confirm(`Delete "${cat.name}"?`) && del.mutate(cat.id)}>Delete</Button>}
        </div>
      </div>
    </div>
  );
};

export default function AdminCategoriesPage() {
  const { data, isLoading } = useAdminCategories();
  return (
    <div className="space-y-4">
      <h1 className="font-serif text-display">Categories</h1>
      <p className="text-2xs text-muted-foreground">The first 6 categories (by order) that have an image appear in the homepage grid.</p>
      {isLoading ? <Skeleton className="h-64" /> : data?.map((c) => <Row key={c.id} cat={c} />)}
      <h2 className="pt-4 font-serif text-xl font-extrabold">New category</h2>
      <Row />
    </div>
  );
}