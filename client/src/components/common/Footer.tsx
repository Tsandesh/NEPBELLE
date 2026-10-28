import { Link } from 'react-router-dom';
import { images } from '@/assets/images';

const COLS: { title: string; links: [string, string][] }[] = [
  { title: 'Top Categories', links: [['Anarkali Suit Sets', '/shop/anarkali-suit-sets'], ['Kurtas', '/shop/kurtas-tops'], ['Nepbelle Girls', '/shop/girls'], ['Jewellery', '/shop/jewellery'], ['Palazzos', '/shop/bottomwear'], ['Straight Suit Sets', '/shop/straight-suit-sets']] },
  { title: 'Customer Service', links: [['Returns & Cancellation', '/help/returns'], ['FAQs', '/help/faqs'], ['Contact us', '/help/contact'], ['Grievance Handling Mechanism', '/help/grievance']] },
  // { title: 'Nepbelle Brand', links: [['About us', '/about'], ['Investor Information', '/investors'], ['Business Enquiry', '/business'], ['Achievements', '/achievements'], ['Store locator', '/stores']] },
  { title: 'My Profile', links: [['My account', '/account'], ['Track Order', '/track-order'], ['Return & Cancellation', '/help/returns'], ['My cart', '/cart'], ['Wishlist', '/account/wishlist'], ['Order history', '/account/orders']] },
  { title: 'Quick Links', links: [['Shipping Policy', '/help/shipping'], ['Privacy Policy', '/help/privacy'], ['Careers', '/careers'], ['Terms of use', '/help/terms']] },
];
const SOCIAL = [['facebook', 'Facebook'], ['instagram', 'Instagram'], ['twitter', 'Twitter'], ['youtube', 'YouTube'], ['pinterest', 'Pinterest']] as const;

export const Footer = () => (
  <footer className="bg-brand-hover px-4 pb-1 pt-10 text-white md:px-11">
    <div className="mx-auto max-w-[1248px]">
      <div className="grid grid-cols-auto gap-6 pb-6 md:grid-cols-[repeat(4,1fr)]">
        {COLS.map((c) => (
          <div key={c.title} className="flex flex-col gap-3">
            <h4 className="font-sans text-base font-normal uppercase leading-5">{c.title}</h4>
            <ul>{c.links.map(([l, to]) => <li key={l} className="flex h-[42px] items-center"><Link to={to} className="font-serif text-md font-extrabold leading-[18px] hover:underline">{l}</Link></li>)}</ul>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4 py-6">
        <div className="flex items-center gap-4"><span className="text-base">Follow us</span>
          {SOCIAL.map(([k, label]) => <a key={k} href="#" aria-label={label} className="flex size-6 items-center justify-center rounded-[5px] bg-white/10"><img src={images.icons[k]} alt="" className="size-3.5" /></a>)}
        </div>
        <div className="flex items-center gap-2"><img src={images.icons.shield} alt="" className="size-[18px]" /><span className="font-serif text-sm font-extrabold">100% Secure Payments</span></div>
      </div>
      <hr className="border-white/[0.14]" />
     
    </div>
  </footer>
);
