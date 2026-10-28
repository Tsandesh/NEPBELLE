import { Link } from 'react-router-dom';
import { images } from '@/assets/images';
import { SectionHeader } from '@/components/common/SectionHeader';
import { ProductCarousel } from '@/components/common/ProductCarousel';
import { HeroCarousel } from '@/components/common/HeroCarousel';
import { Skeleton } from '@/components/ui/skeleton';
import { useProducts } from '@/features/catalog/hooks/useCatalog';
import { useHomeContent } from '@/features/catalog/hooks/useHomeContent';
import { assetUrl } from '@/utils/assets';


export default function HomePage() {
  const mostLoved = useProducts({ collection: 'most-loved', limit: 12 });
  const recommended = useProducts({ collection: 'recommended', limit: 12 });
  const { data: home, isLoading } = useHomeContent();

  // Admin-managed slides. Falls back to the static ones only if none exist yet.
  const slides = home?.hero.length
    ? home.hero.map((b) => ({ src: assetUrl(b.imageUrl), alt: b.alt }))
    : images.hero;

  return (
    <div>
      {isLoading ? <Skeleton className="h-[420px] w-full md:h-[650px]" /> : <HeroCarousel slides={slides} />}

      {/* Category grid: 6 × (386×265), gap 13 */}
      <section aria-label="Shop by category" className="container-nb py-6">
        <div className="grid grid-cols-2 gap-[13px] lg:grid-cols-3">
          {isLoading
            ? Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-[265px]" />)
            : home?.categories.map((c) => (
                <Link key={c.id} to={`/shop/${c.slug}`} className="block h-[265px] overflow-hidden bg-thumb">
                  <img src={assetUrl(c.imageUrl)} alt={c.name} loading="lazy" className="size-full object-cover transition-transform duration-300 hover:scale-105" />
                </Link>
              ))}
        </div>
      </section>

      <section aria-labelledby="most-loved" className="section-gradient container-nb py-10 max-w-none">
        <div className="mx-auto max-w-[1337px] px-0 md:px-11"><div id="most-loved"><SectionHeader title="Most Loved" /></div>
          <ProductCarousel products={mostLoved.data?.items} loading={mostLoved.isLoading} /></div>
      </section>

      {home?.editorial && (
        <Link to={home.editorial.linkUrl ?? '/shop'} className="container-nb block">
          <img src={assetUrl(home.editorial.imageUrl)} alt={home.editorial.alt} loading="lazy" className="h-[320px] w-full object-cover md:h-[503px]" />
        </Link>
      )}

      <section aria-labelledby="recommended" className="section-gradient py-10">
        <div className="mx-auto max-w-[1337px] px-4 md:px-11"><div id="recommended"><SectionHeader title="Recommended for you" /></div>
          <ProductCarousel products={recommended.data?.items} loading={recommended.isLoading} /></div>
      </section>

      {!!home?.colours.length && (
        <section aria-labelledby="by-colour" className="bg-section-tint pb-16 pt-14">
          <div className="mx-auto max-w-[1337px] px-4 md:px-11"><div id="by-colour"><SectionHeader title="Shop by color" size="lg" /></div>
            <div className="mx-auto grid max-w-[1248px] grid-cols-2 gap-5 md:grid-cols-4">
              {home.colours.map((c) => (
                <Link key={c.id} to={c.linkUrl ?? '/shop'} aria-label={c.label ? `Shop ${c.label}` : 'Shop'} className="block aspect-[297/407] overflow-hidden rounded-t-[50px] bg-thumb">
                  <img src={assetUrl(c.imageUrl)} alt={c.alt} loading="lazy" className="size-full object-cover transition-transform duration-300 hover:scale-105" />
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}