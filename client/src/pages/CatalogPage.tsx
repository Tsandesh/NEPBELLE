import { useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ProductCard, ProductCardSkeleton } from '@/components/common/ProductCard';
import { EmptyState } from '@/components/common/EmptyState';
import { ColourSwatch } from '@/components/common/ColourSwatch';
import { useFacets, useProducts } from '@/features/catalog/hooks/useCatalog';
import type { ProductFilters } from '@/features/catalog/types';

const SORTS = [['newest', 'Newest'], ['price-asc', 'Price: low to high'], ['price-desc', 'Price: high to low']] as const;

// Figma 01.2 Search / Category grid + 01.3 Product listing
export default function CatalogPage() {
  const { category } = useParams();
  const [sp, setSp] = useSearchParams();
  const list = (k: string) => sp.get(k)?.split(',').filter(Boolean) ?? [];
  const filters: ProductFilters = useMemo(() => ({
    category, q: sp.get('q') ?? undefined, sizes: list('sizes').length ? list('sizes') : undefined, colours: list('colours').length ? list('colours') : undefined,
    sort: (sp.get('sort') as ProductFilters['sort']) ?? 'newest', page: Number(sp.get('page') ?? 1), limit: 12, ...(sp.get('sale') ? { sale: true } : {}),
  } as ProductFilters), [category, sp]);

  const { data, isLoading, isError, refetch, isFetching } = useProducts(filters);
  const { data: facets } = useFacets(category);

  const set = (k: string, v?: string) => { const n = new URLSearchParams(sp); v ? n.set(k, v) : n.delete(k); if (k !== 'page') n.delete('page'); setSp(n); };
  const toggle = (k: string, v: string) => { const cur = list(k); set(k, (cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v]).join(',') || undefined); };
  const title = filters.q ? `Results for “${filters.q}”` : category ? category.replace(/-/g, ' ') : sp.get('sale') ? 'Sale' : 'All products';

  return (
    <div className="container-nb py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div><h1 className="font-serif text-display capitalize text-ink">{title}</h1>{data && <p className="text-muted-foreground">{data.meta.total} items</p>}</div>
        <div className="flex items-center gap-2"><Label htmlFor="sort">Sort by</Label>
          <select id="sort" value={filters.sort} onChange={(e) => set('sort', e.target.value)} className="h-11 border border-line bg-white px-3 text-sm">{SORTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></div>
      </div>

      <div className="grid gap-10 md:grid-cols-[220px_1fr]">
        <aside aria-label="Filters" className="space-y-6">
          <fieldset><legend className="mb-3 font-serif text-base font-extrabold">Size</legend>
            <div className="space-y-2.5">{facets?.sizes.map((s) => <div key={s} className="flex items-center gap-2.5"><Checkbox id={`s-${s}`} checked={list('sizes').includes(s)} onCheckedChange={() => toggle('sizes', s)} /><Label htmlFor={`s-${s}`} className="font-sans font-normal text-muted-foreground">{s}</Label></div>)}</div></fieldset>
          <fieldset><legend className="mb-3 font-serif text-base font-extrabold">Colour</legend>
            <div className="flex flex-wrap gap-2">{facets?.colours.map((c) => <ColourSwatch key={c.name} {...c} selected={list('colours').includes(c.name)} onSelect={() => toggle('colours', c.name)} />)}</div></fieldset>
          {(sp.get('sizes') || sp.get('colours')) && <Button variant="secondary" size="sm" onClick={() => setSp(new URLSearchParams(filters.q ? { q: filters.q } : {}))}>Clear filters</Button>}
        </aside>

        <div>
          {isError ? <EmptyState title="We couldn’t load products" action={<Button onClick={() => refetch()}>Try again</Button>}>Please check your connection and retry.</EmptyState>
          : isLoading ? <div className="grid grid-cols-2 gap-x-2.5 gap-y-6 lg:grid-cols-4">{Array.from({ length: 8 }, (_, i) => <ProductCardSkeleton key={i} />)}</div>
          : !data?.items.length ? <EmptyState title="No products found">Try removing a filter or searching for something else.</EmptyState>
          : <>
              <div className={`grid grid-cols-2 justify-items-center gap-x-2.5 gap-y-6 transition-opacity lg:grid-cols-4 ${isFetching ? 'opacity-60' : ''}`}>{data.items.map((p) => <ProductCard key={p.id} product={p} quickView />)}</div>
              {data.meta.totalPages > 1 && (
                <nav aria-label="Pagination" className="mt-10 flex items-center justify-center gap-3">
                  <Button variant="secondary" size="sm" disabled={data.meta.page <= 1} onClick={() => set('page', String(data.meta.page - 1))}>Previous</Button>
                  <span className="text-sm">Page {data.meta.page} of {data.meta.totalPages}</span>
                  <Button variant="secondary" size="sm" disabled={data.meta.page >= data.meta.totalPages} onClick={() => set('page', String(data.meta.page + 1))}>Next</Button>
                </nav>)}
            </>}
        </div>
      </div>
    </div>
  );
}
