import { Link, Outlet, ScrollRestoration, useLocation } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { Logo } from '@/components/common/Logo';
import { Footer } from '@/components/common/Footer';
import { PageTransition } from '@/components/common/PageTransition';
import { cn } from '@/utils/cn';

const STEPS = [{ to: '/checkout/shipping', label: 'Shipping' }, { to: '/checkout/payment', label: 'Payment' }];

export default function CheckoutLayout() {
  const { pathname } = useLocation();
  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <header className="flex h-[100px] items-center justify-between bg-brand-hover px-4 text-white md:px-11">
        <Logo />
        <ol className="hidden items-center gap-6 font-serif text-sm font-extrabold uppercase md:flex">
          {STEPS.map((s, i) => <li key={s.to} className={cn('flex items-center gap-2', pathname !== s.to && 'opacity-60')}><span className="flex size-6 items-center justify-center rounded-full border border-white text-2xs">{i + 1}</span>{s.label}</li>)}
        </ol>
        <Link to="/cart" className="flex items-center gap-1 text-sm"><Lock className="size-4" /> Secure checkout</Link>
      </header>
      <div key={pathname} className="flex-1"><PageTransition><Outlet /></PageTransition></div>
      <Footer /><ScrollRestoration />
    </div>
  );
}
