import { Outlet, ScrollRestoration, useLocation } from 'react-router-dom';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { CookieBanner } from '@/components/common/CookieBanner';
import { PageTransition } from '@/components/common/PageTransition';
import { CartDrawer } from '@/features/cart/components/CartDrawer';
import { QuickView } from '@/features/catalog/components/QuickView';

export default function RootLayout() {
  const { pathname } = useLocation();

  return (
    <div className="flex min-h-screen flex-col">
      <Header variant={pathname === '/' ? 'overlay' : 'solid'} />
      <div key={pathname} className="flex-1"><PageTransition><Outlet /></PageTransition></div>
      <Footer />
      <CartDrawer /><QuickView /><CookieBanner />
      <ScrollRestoration />
    </div>
  );
}
