import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useAdminProducts, useDeleteProduct } from '@/features/admin/hooks/useAdmin';

import { formatCurrency } from '@/utils/format';
import { assetUrl } from '@/utils/assets';

export default function AdminProductsPage() {
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const { data, isLoading } = useAdminProducts(q, page);
  const del = useDeleteProduct();
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="font-serif text-display">Products</h1>
        <Button asChild><Link to="/admin/products/new">Add product</Link></Button>
      </div>
      <Input aria-label="Search products" placeholder="Search by name or slug" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} />
      {isLoading ? <Skeleton className="h-64" /> : (
        <div className="overflow-x-auto border border-line-soft bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-canvas font-serif"><tr>{['', 'Name', 'Category', 'Price', 'Stock', ''].map((h, i) => <th key={i} className="px-3 py-3 font-extrabold">{h}</th>)}</tr></thead>
            <tbody>
              {data?.items.map((p) => (
                <tr key={p.id} className="border-t border-line-soft">
                  <td className="px-3 py-2"><img src={assetUrl(p.images[0])} alt="" className="h-[60px] w-[45px] bg-thumb object-cover" /></td>
                  <td className="px-3 py-2 font-serif font-extrabold">{p.name}</td>
                  <td className="px-3 py-2">{p.category.name}</td>
                  <td className="px-3 py-2">{formatCurrency(p.priceCents)}</td>
                  <td className="px-3 py-2">{p.variants.reduce((n, v) => n + v.stock, 0)}</td>
                  <td className="space-x-2 whitespace-nowrap px-3 py-2 text-right">
                    <Button asChild size="sm" variant="secondary"><Link to={`/admin/products/${p.id}`}>Edit</Link></Button>
                    <Button size="sm" variant="secondary" disabled={del.isPending} onClick={() => confirm(`Delete "${p.name}"?`) && del.mutate(p.id)}>Delete</Button>
                  </td>
                </tr>
              ))}
              {!data?.items.length && <tr><td colSpan={6} className="px-3 py-10 text-center text-muted-foreground">No products found.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
      {data && data.meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button size="sm" variant="secondary" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
          <span className="text-sm">Page {page} of {data.meta.totalPages}</span>
          <Button size="sm" variant="secondary" disabled={page >= data.meta.totalPages} onClick={() => setPage(page + 1)}>Next</Button>
        </div>
      )}
    </div>
  );
}