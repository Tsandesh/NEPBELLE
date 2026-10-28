import { Outlet, ScrollRestoration } from 'react-router-dom';
import { Header } from '@/components/common/Header';
import { PageTransition } from '@/components/common/PageTransition';

export default function AuthLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <Header />
      <div className="flex flex-1 items-center justify-center px-4 py-12"><div className="w-full max-w-[440px] border border-line-soft bg-white p-8"><PageTransition><Outlet /></PageTransition></div></div>
      <ScrollRestoration />
    </div>
  );
}
