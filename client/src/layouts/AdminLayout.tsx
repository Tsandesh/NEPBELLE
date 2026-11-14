import { Link, NavLink, Outlet, ScrollRestoration } from 'react-router-dom';
import { cn } from '@/utils/cn';
import { useAdminSummary } from '@/features/admin/hooks/useAdminOrders';

const LINKS = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/orders', label: 'Orders', badge: true },
  { to: '/admin/products', label: 'Products' },
  { to: '/admin/categories', label: 'Categories' },
  { to: '/admin/colours', label: 'Colours' },
  { to: '/admin/homepage', label: 'Homepage images' },
];

export default function AdminLayout() {
  const { data: s } = useAdminSummary();
  return (
    <div className="min-h-screen bg-canvas">
      <header className="flex h-16 items-center justify-between bg-brand-hover px-6 text-white">
        <Link to="/admin" className="font-serif text-xl font-extrabold tracking-[0.18em]">NEPBELLE ADMIN</Link>
        <Link to="/" className="text-sm underline">View store</Link>
      </header>
      <div className="mx-auto grid max-w-[1200px] gap-8 px-4 py-8 md:grid-cols-[200px_1fr]">
        <nav aria-label="Admin" className="flex gap-2 overflow-x-auto md:flex-col">
          {LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => cn('flex items-center justify-between px-3 py-2.5 font-serif text-sm font-extrabold', isActive ? 'bg-brand text-white' : 'hover:bg-brand-tint')}>
              {l.label}{l.badge && !!s?.needsAction && <span className="ml-2 rounded-full bg-accent px-2 text-2xs text-ink">{s.needsAction}</span>}
            </NavLink>))}
        </nav>
        <main className="min-w-0"><Outlet /></main>
      </div>
      <ScrollRestoration />
    </div>
  );
}