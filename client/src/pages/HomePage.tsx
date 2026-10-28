import { Link } from 'react-router-dom';
import { images } from '@/assets/images';
import { SectionHeader } from '@/components/common/SectionHeader';
import { ProductCarousel } from '@/components/common/ProductCarousel';
import { useProducts, useCategories } from '@/features/catalog/hooks/useCatalog';
import { HeroCarousel } from '@/components/common/HeroCarousel';

// Shop-by-colour targets (Figma 9:168). Card artwork has no text, so targets are an assumption.
const COLOUR_CARDS = [{ label: 'Ivory', q: 'Ivory' }, { label: 'Green', q: 'Green' }, { label: 'Pink', q: 'Pink' }, { label: 'Black', q: 'Black' }];
const SLIDES = images.hero;
console.log('SLIDES', SLIDES);


export default function HomePage() {
  const mostLoved = useProducts({ collection: 'most-loved', limit: 12 });
  const recommended = useProducts({ collection: 'recommended', limit: 12 });
  const { data: categories } = useCategories();
  const gridCats = categories?.filter((c) => c.imageUrl).slice(0, 6);



  return (
    <div>
      {/* Hero/Banner 650px — header overlays it */}
      {/* <section aria-label="Featured" className="relative h-[420px] overflow-hidden md:h-[650px]">
        {SLIDES.map((src, i) => <img key={i} src={src} alt="Desi, your way — new season collection" className="absolute inset-0 size-full object-cover" />)}
        {SLIDES.length > 1 && (
          <div className="absolute inset-x-0 bottom-8 flex items-center justify-center gap-2.5">
            {SLIDES.map((_, i) => <span key={i} className={cn('size-1.5 rounded-full', i === 0 ? 'bg-brand' : 'bg-white')} />)}
          </div>
        )}
      </section> */}

        <HeroCarousel slides={SLIDES} />

      {/* Category grid: 6 × (386×265), gap 13 */}
      <section aria-label="Shop by category" className="container-nb py-6">
        <div className="grid grid-cols-2 gap-[13px] lg:grid-cols-3">
          {(gridCats ?? Array.from({ length: 6 })).map((c, i) => (
            <Link key={c?.id ?? i} to={c ? `/shop/${c.slug}` : '/shop'} className="block h-[265px] overflow-hidden bg-thumb">
              <img src={images.categories[i]} alt={c?.name ?? ''} loading="lazy" className="size-full object-cover transition-transform duration-300 hover:scale-105" />
            </Link>
          ))}
        </div>
      </section>

      <section aria-labelledby="most-loved" className="section-gradient container-nb py-10 max-w-none">
        <div className="mx-auto max-w-[1337px] px-0 md:px-11"><div id="most-loved"><SectionHeader title="Most Loved" /></div>
          <ProductCarousel products={mostLoved.data?.items} loading={mostLoved.isLoading} /></div>
      </section>

      <Link to="/shop?sale=1" className="container-nb block"><img src={images.editorial} alt="Festive edit" loading="lazy" className="h-[320px] w-full object-cover md:h-[503px]" /></Link>

      <section aria-labelledby="recommended" className="section-gradient py-10">
        <div className="mx-auto max-w-[1337px] px-4 md:px-11"><div id="recommended"><SectionHeader title="Recommended for you" /></div>
          <ProductCarousel products={recommended.data?.items} loading={recommended.isLoading} /></div>
      </section>

      <section aria-labelledby="by-colour" className="bg-section-tint pb-16 pt-14">
        <div className="mx-auto max-w-[1337px] px-4 md:px-11"><div id="by-colour"><SectionHeader title="Shop by color" size="lg" /></div>
          <div className="mx-auto grid max-w-[1248px] grid-cols-2 gap-5 md:grid-cols-4">
            {COLOUR_CARDS.map((c, i) => (
              <Link key={c.label} to={`/shop?colours=${c.q}`} aria-label={`Shop ${c.label}`} className="block aspect-[297/407] overflow-hidden rounded-t-[50px] bg-thumb">
                <img src={images.colours[i]} alt="" loading="lazy" className="size-full object-cover transition-transform duration-300 hover:scale-105" />
              </Link>
            ))}
          </div></div>
      </section>
    </div>
  );
}
