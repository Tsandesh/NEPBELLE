import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/button';
import { useAuth, useLogout } from '@/features/auth/hooks/useAuth';

const LINKS = [{ to: '/account', label: 'Profile', end: true }, { to: '/account/orders', label: 'Order history' }, { to: '/account/wishlist', label: 'Wishlist' }];

// Figma 04 · Account & Support Flow
export default function AccountLayout() {
  const { user } = useAuth();
  const logout = useLogout();
  const nav = useNavigate();
  return (
    <div className="container-nb grid gap-10 py-10 md:grid-cols-[220px_1fr]">
      <aside className="space-y-4">
        <p className="font-serif text-xl font-extrabold">Hi, {user?.firstName}</p>
        <nav aria-label="Account" className="flex flex-row gap-2 md:flex-col">
          {LINKS.map((l) => <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => cn('px-3 py-2.5 font-serif text-sm font-extrabold', isActive ? 'bg-brand text-white' : 'hover:bg-brand-tint')}>{l.label}</NavLink>)}
          {user?.role === 'ADMIN' && <NavLink to="/admin" className="px-3 py-2.5 font-serif text-sm font-extrabold hover:bg-brand-tint">Admin</NavLink>}
        </nav>
        <Button variant="secondary" size="sm" onClick={() => logout.mutate(undefined, { onSettled: () => nav('/') })}>Sign out</Button>
      </aside>
      <section><Outlet /></section>
    </div>
  );
}
