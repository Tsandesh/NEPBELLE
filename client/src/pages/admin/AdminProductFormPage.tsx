import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { getErrorMessage, getFieldErrors } from '@/services/api';
import { ImageUploader } from '@/features/admin/components/ImageUploader';
import { useAdminCategories, useAdminColours, useAdminProduct, useSaveProduct } from '@/features/admin/hooks/useAdmin';

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const COLLECTIONS = [['most-loved', 'Most Loved'], ['recommended', 'Recommended for you']] as const;
interface Row { colourId: string; stock: Record<string, number> }
const zeroStock = () => Object.fromEntries(SIZES.map((s) => [s, 0]));
const blankRow = (): Row => ({ colourId: '', stock: zeroStock() });
const field = 'w-full border border-line bg-white px-3 text-sm outline-none focus:border-2 focus:border-brand';

export default function AdminProductFormPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const { data: product, isLoading } = useAdminProduct(id);
  const { data: categories } = useAdminCategories();
  const { data: colours } = useAdminColours();
  const save = useSaveProduct();

  const [f, setF] = useState({ name: '', slug: '', description: '', fabric: '', price: '', compareAt: '', badge: '', onSale: false, categoryId: '', collections: [] as string[], images: [] as string[] });
  const [rows, setRows] = useState<Row[]>([blankRow()]);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [formError, setFormError] = useState<string>();

  useEffect(() => {
    if (!product) return;
    setF({
      name: product.name, slug: product.slug, description: product.description, fabric: product.fabric ?? '',
      price: (product.priceCents / 100).toFixed(2), compareAt: product.compareAtCents ? (product.compareAtCents / 100).toFixed(2) : '',
      badge: product.badge ?? '', onSale: product.onSale, categoryId: product.categoryId, collections: product.collections, images: product.images,
    });
    const map = new Map<string, Row>();
    product.variants.forEach((v) => {
      const r = map.get(v.colourId) ?? { colourId: v.colourId, stock: zeroStock() };
      r.stock[v.size] = v.stock; map.set(v.colourId, r);
    });
    setRows(map.size ? [...map.values()] : [blankRow()]);
  }, [product]);

  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((p) => ({ ...p, [k]: v }));
  const setRow = (i: number, patch: Partial<Row>) => setRows((rs) => rs.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  const e = (...keys: string[]) => keys.map((k) => errors[k]?.[0]).find(Boolean);

  const submit = (ev: FormEvent) => {
    ev.preventDefault();
    setFormError(undefined);
    const priceCents = Math.round(parseFloat(f.price) * 100);
    const compareAtCents = f.compareAt ? Math.round(parseFloat(f.compareAt) * 100) : null;
    const local: Record<string, string[]> = {};
    if (f.name.trim().length < 2) local.name = ['Enter a product name.'];
    if (!f.description.trim()) local.description = ['Enter a description.'];
    if (!Number.isFinite(priceCents) || priceCents < 0) local.price = ['Enter a valid price.'];
    if (compareAtCents !== null && compareAtCents <= priceCents) local.compareAt = ['Must be higher than the price.'];
    if (!f.categoryId) local.categoryId = ['Choose a category.'];
    if (!f.images.length) local.images = ['Upload at least one image.'];
    const chosen = rows.filter((r) => r.colourId);
    const ids = chosen.map((r) => r.colourId);
    if (!chosen.length) local.variants = ['Add at least one colour.'];
    else if (new Set(ids).size !== ids.length) local.variants = ['Each colour can only be used once per product.'];
    const variants = chosen.flatMap((r) => SIZES.map((size) => ({ colourId: r.colourId, size, stock: Math.max(0, Math.floor(Number(r.stock[size]) || 0)) })));
    setErrors(local);
    if (Object.keys(local).length) return;

    save.mutate(
      { id, body: { name: f.name.trim(), slug: f.slug.trim() || undefined, description: f.description.trim(), fabric: f.fabric.trim() || null, priceCents, compareAtCents, images: f.images, badge: f.badge.trim() || null, onSale: f.onSale, collections: f.collections, categoryId: f.categoryId, variants } },
      { onSuccess: () => nav('/admin/products'), onError: (err) => { setErrors(getFieldErrors(err) ?? {}); setFormError(getErrorMessage(err)); } },
    );
  };

  if (id && isLoading) return <Skeleton className="h-96" />;
  return (
    <form noValidate onSubmit={submit} className="space-y-8">
      <h1 className="font-serif text-display">{id ? 'Edit product' : 'Add product'}</h1>

      <section className="space-y-4 border border-line-soft bg-white p-5">
        <Input label="Name" value={f.name} onChange={(ev) => set('name', ev.target.value)} error={e('name')} />
        <div className="grid gap-4 md:grid-cols-2">
          <Input label="Slug (optional, auto from name)" value={f.slug} onChange={(ev) => set('slug', ev.target.value)} error={e('slug')} />
          <div className="flex flex-col gap-1.5"><Label htmlFor="cat">Category</Label>
            <select id="cat" value={f.categoryId} onChange={(ev) => set('categoryId', ev.target.value)} className={`${field} h-11`}>
              <option value="">Select…</option>{categories?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>{e('categoryId') && <p role="alert" className="text-2xs text-brand">{e('categoryId')}</p>}</div>
        </div>
        <div className="flex flex-col gap-1.5"><Label htmlFor="desc">Description</Label>
          <textarea id="desc" rows={4} value={f.description} onChange={(ev) => set('description', ev.target.value)} className={`${field} py-2`} />
          {e('description') && <p role="alert" className="text-2xs text-brand">{e('description')}</p>}</div>
        <div className="grid gap-4 md:grid-cols-4">
          <Input label="Price (AU$)" inputMode="decimal" value={f.price} onChange={(ev) => set('price', ev.target.value)} error={e('price', 'priceCents')} />
          <Input label="Compare-at (AU$)" inputMode="decimal" value={f.compareAt} onChange={(ev) => set('compareAt', ev.target.value)} error={e('compareAt', 'compareAtCents')} />
          <Input label="Fabric" value={f.fabric} onChange={(ev) => set('fabric', ev.target.value)} />
          <Input label="Badge (e.g. Online Exclusive)" value={f.badge} onChange={(ev) => set('badge', ev.target.value)} />
        </div>
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2.5"><Checkbox id="sale" checked={f.onSale} onCheckedChange={(c) => set('onSale', c === true)} /><Label htmlFor="sale" className="font-sans font-normal">On sale</Label></div>
          {COLLECTIONS.map(([v, l]) => (
            <div key={v} className="flex items-center gap-2.5">
              <Checkbox id={v} checked={f.collections.includes(v)} onCheckedChange={(c) => set('collections', c === true ? [...f.collections, v] : f.collections.filter((x) => x !== v))} />
              <Label htmlFor={v} className="font-sans font-normal">Show in “{l}”</Label>
            </div>))}
        </div>
      </section>

      <section className="border border-line-soft bg-white p-5">
        <ImageUploader label="Images (first is the main image; reorder with the arrows)" value={f.images} onChange={(u) => set('images', u)} max={10} error={e('images')} />
      </section>

      <section className="space-y-4 border border-line-soft bg-white p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl font-extrabold">Colours and stock</h2>
          <Link to="/admin/colours" className="text-sm underline">Manage colours</Link>
        </div>
        {rows.map((r, i) => {
          const picked = colours?.find((c) => c.id === r.colourId);
          const takenElsewhere = new Set(rows.filter((_, j) => j !== i).map((x) => x.colourId));
          return (
            <div key={i} className="space-y-3 border border-line-soft p-4">
              <div className="flex flex-wrap items-end gap-4">
                <span aria-hidden className="size-11 shrink-0 border border-line" style={{ background: picked?.hex ?? 'transparent' }} />
                <div className="flex min-w-[220px] flex-1 flex-col gap-1.5">
                  <Label htmlFor={`col-${i}`}>Colour</Label>
                  <select id={`col-${i}`} value={r.colourId} onChange={(ev) => setRow(i, { colourId: ev.target.value })} className={`${field} h-11`}>
                    <option value="">Select a colour…</option>
                    {colours?.map((c) => <option key={c.id} value={c.id} disabled={takenElsewhere.has(c.id)}>{c.name}</option>)}
                  </select>
                </div>
                {rows.length > 1 && <Button type="button" size="sm" variant="secondary" onClick={() => setRows((rs) => rs.filter((_, j) => j !== i))}>Remove</Button>}
              </div>
              <div className="grid grid-cols-3 gap-3 md:grid-cols-6">
                {SIZES.map((s) => (
                  <div key={s} className="flex flex-col gap-1"><Label htmlFor={`st-${i}-${s}`} className="text-2xs">{s} stock</Label>
                    <input id={`st-${i}-${s}`} type="number" min={0} value={r.stock[s]} onChange={(ev) => setRow(i, { stock: { ...r.stock, [s]: Number(ev.target.value) } })} className={`${field} h-10`} /></div>))}
              </div>
            </div>
          );
        })}
        {e('variants') && <p role="alert" className="text-2xs text-brand">{e('variants')}</p>}
        <Button type="button" variant="secondary" size="sm" onClick={() => setRows((rs) => [...rs, blankRow()])}>Add colour</Button>
      </section>

      {formError && <p role="alert" className="text-brand">{formError}</p>}
      <div className="flex gap-3"><Button loading={save.isPending}>{id ? 'Save changes' : 'Create product'}</Button><Button asChild variant="secondary"><Link to="/admin/products">Cancel</Link></Button></div>
    </form>
  );
}