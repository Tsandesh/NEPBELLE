import { FormEvent, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { cn } from '@/utils/cn';
import { images } from '@/assets/images';
import { Logo } from './Logo';
import { useCart } from '@/features/cart/hooks/useCart';
import { useUiStore } from '@/store/uiStore';
import { useAuth } from '@/features/auth/hooks/useAuth';

// Figma Nav/Categories (9:31993). `bold` = Abhaya ExtraBold + #a72f30 chip.
const NAV = [
  { label: "AW'26", to: '/shop/aw26', chip: true }, { label: 'SALWAR KAMEEZ', to: '/shop/salwar-kameez' },
  { label: 'KURTAS & TOPS', to: '/shop/kurtas-tops' }, { label: 'DRESSES', to: '/shop/dresses' },
  { label: 'NEPBELLE NXT', to: '/shop/nepbelle-nxt' }, { label: 'DRESS MATERIAL', to: '/shop/dress-material' },
  { label: 'BOTTOMS', to: '/shop/bottomwear' }, { label: 'JEWELLERY', to: '/shop/jewellery' }, { label: 'GIRLS', to: '/shop/girls' },
  { label: 'COLLECTIONS', to: '/shop/collections' }, { label: 'SALE', to: '/shop?sale=1', chip: true }, { label: 'NEPBELLE LUXE', to: '/shop/nepbelle-luxe' },
];

interface Props { variant?: 'overlay' | 'solid' }

export const Header = ({ variant = 'solid' }: Props) => {
  const nav = useNavigate();
  const [q, setQ] = useState('');
  const { data: cart } = useCart();
  const { isAuthenticated } = useAuth();
  const setBagOpen = useUiStore((s) => s.setBagOpen);
  const submit = (e: FormEvent) => { e.preventDefault(); if (q.trim()) nav(`/search?q=${encodeURIComponent(q.trim())}`); };

  return (
    <header className={cn('z-30 w-full text-white', variant === 'overlay' ? 'absolute inset-x-0 top-0 shadow-[inset_0_66px_10px_0_rgba(0,0,0,0.4)]' : 'relative bg-brand-hover')}>
      <div className="flex h-8 items-center justify-center bg-accent">
        <Link to="/shop?sale=1" className="font-serif text-sm font-extrabold uppercase text-ink underline">AW'26 is here! Discover the new season of elegance 😍</Link>
      </div>

      <div className="flex h-[68px] items-center justify-between gap-4 px-4 md:px-11">
        <Logo />
        <div className="hidden items-center gap-1 rounded-[3px] bg-brand-hover/[0.13] px-2 py-[5px] font-serif text-sm font-extrabold lg:flex"><span>Ship to</span><span>Australia (A$)</span></div>
        <form onSubmit={submit} role="search" className="hidden h-[38px] w-[394px] items-center gap-2 rounded-[30px] border-[0.5px] border-[rgba(199,199,199,0.6)] bg-[rgba(243,235,226,0.1)] px-3 md:flex">
          <img src={images.icons.search} alt="" className="size-[18px]" />
          <input value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search" placeholder="Search kurta, shirts and dupattas"
            className="w-full bg-transparent font-serif text-sm font-extrabold text-white outline-none placeholder:text-placeholder" />
        </form>
        <nav aria-label="Account" className="flex items-center gap-4">
          <Link to="/account/wishlist" aria-label="Wishlist"><img src={images.icons.heart} alt="" className="size-6" /></Link>
          <button type="button" aria-label={`Bag, ${cart?.itemCount ?? 0} items`} onClick={() => setBagOpen(true)} className="relative">
            <img src={images.icons.bag} alt="" className="size-6" />
            {!!cart?.itemCount && <span className="absolute -right-2 -top-2 flex size-4 items-center justify-center rounded-full bg-accent text-[10px] text-ink">{cart.itemCount}</span>}
          </button>
          <Link to={isAuthenticated ? '/account' : '/login'} aria-label="Account"><img src={images.icons.user} alt="" className="size-6" /></Link>
        </nav>
      </div>

      <nav aria-label="Categories" className="hidden h-[39px] items-center overflow-x-auto border-b border-white/40 px-4 md:flex md:px-11">
        {NAV.map((n) => (
          <NavLink key={n.label} to={n.to} className={cn('flex h-[39px] shrink-0 items-center px-2 text-sm uppercase tracking-[0.6px]', n.chip ? 'bg-brand-hover font-serif font-extrabold' : 'font-sans')}>{n.label}</NavLink>
        ))}
      </nav>
    </header>
  );
};
