import { Link } from 'react-router-dom';
import { images } from '@/assets/images';

const COLS: { title: string; links: [string, string][] }[] = [
  { title: 'Top Categories', links: [['Anarkali Suit Sets', '/shop/anarkali-suit-sets'], ['Kurtas', '/shop/kurtas-tops'], ['Nepbelle Girls', '/shop/girls'], ['Jewellery', '/shop/jewellery'], ['Palazzos', '/shop/bottomwear'], ['Straight Suit Sets', '/shop/straight-suit-sets']] },
  { title: 'Customer Service', links: [['Returns & Cancellation', '/help/returns'], ['FAQs', '/help/faqs'], ['Contact us', '/help/contact'], ['Grievance Handling Mechanism', '/help/grievance'], ['Blog', '/blog']] },
  { title: 'Nepbelle Brand', links: [['About us', '/about'], ['Investor Information', '/investors'], ['Business Enquiry', '/business'], ['Achievements', '/achievements'], ['Store locator', '/stores']] },
  { title: 'My Profile', links: [['My account', '/account'], ['Track Order', '/track-order'], ['Return & Cancellation', '/help/returns'], ['My cart', '/cart'], ['Wishlist', '/account/wishlist'], ['Order history', '/account/orders']] },
  { title: 'Quick Links', links: [['Shipping Policy', '/help/shipping'], ['Privacy Policy', '/help/privacy'], ['Careers', '/careers'], ['Terms of use', '/help/terms']] },
];
const SOCIAL = [['facebook', 'Facebook'], ['instagram', 'Instagram'], ['twitter', 'Twitter'], ['youtube', 'YouTube'], ['pinterest', 'Pinterest']] as const;

export const Footer = () => (
  <footer className="bg-brand-hover px-4 pb-1 pt-10 text-white md:px-11">
    <div className="mx-auto max-w-[1248px]">
      <div className="grid grid-cols-2 gap-x-2 gap-y-6 md:grid-cols-5">
        {COLS.map((c) => (
          <div key={c.title} className="flex flex-col gap-3">
            <h4 className="font-sans text-base font-normal uppercase leading-5">{c.title}</h4>
            <ul>{c.links.map(([l, to]) => <li key={l} className="flex h-[42px] items-center"><Link to={to} className="font-serif text-sm font-extrabold leading-[18px] hover:underline">{l}</Link></li>)}</ul>
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
      <div className="flex flex-col items-center gap-4 pb-4 pt-6 text-center font-serif text-sm font-extrabold leading-[18px]">
        <div className="flex flex-wrap justify-center gap-4"><p>Copyright to Nepbelle store</p><p>Name of Manufacturer - NEPBELLE Fashion Limited</p><p>Country of Manufacture - India</p></div>
        <div className="w-full border border-white px-px pb-5 pt-px">
          <p className="pt-2">BEWARE OF SPURIOUS PHONE CALLS AND FICTITIOUS/FRAUDULENT OFFERS</p>
          <p className="mt-2 px-4">Please be advised that NEPBELLE does not run any promotions or offers involving electronics or high-value products outside of our business. We will never ask for personal information, payments, or banking details over the phone. Any such messages are not authorized by NEPBELLE and should be ignored to protect yourself from potential scams.</p>
        </div>
      </div>
    </div>
  </footer>
);
