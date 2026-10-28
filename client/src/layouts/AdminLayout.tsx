import { Link, NavLink, Outlet, ScrollRestoration } from 'react-router-dom';
import { cn } from '@/utils/cn';

const LINKS = [{ to: '/admin/products', label: 'Products' }, { to: '/admin/categories', label: 'Categories' }, { to: '/admin/homepage', label: 'Homepage images' }];

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-canvas">
      <header className="flex h-16 items-center justify-between bg-brand-hover px-6 text-white">
        <Link to="/admin" className="font-serif text-xl font-extrabold tracking-[0.18em]">NEPBELLE ADMIN</Link>
        <Link to="/" className="text-sm underline">View store</Link>
      </header>
      <div className="mx-auto grid max-w-[1200px] gap-8 px-4 py-8 md:grid-cols-[200px_1fr]">
        <nav aria-label="Admin" className="flex gap-2 md:flex-col">
          {LINKS.map((l) => <NavLink key={l.to} to={l.to} className={({ isActive }) => cn('px-3 py-2.5 font-serif text-sm font-extrabold', isActive ? 'bg-brand text-white' : 'hover:bg-brand-tint')}>{l.label}</NavLink>)}
        </nav>
        <main className="min-w-0"><Outlet /></main>
      </div>
      <ScrollRestoration />
    </div>
  );
}