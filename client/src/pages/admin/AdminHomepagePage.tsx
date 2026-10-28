import { Skeleton } from '@/components/ui/skeleton';
import { BannerEditor } from '@/features/admin/components/BannerEditor';
import { useAdminBanners } from '@/features/admin/hooks/useAdmin';
import type { Banner } from '@/features/catalog/types';

const Block = ({ title, hint, children }: { title: string; hint: string; children: React.ReactNode }) => (
  <section className="space-y-3"><div><h2 className="font-serif text-xl font-extrabold">{title}</h2><p className="text-2xs text-muted-foreground">{hint}</p></div>{children}</section>
);

export default function AdminHomepagePage() {
  const { data, isLoading } = useAdminBanners();
  if (isLoading) return <Skeleton className="h-96" />;
  const by = (s: Banner['section']) => data?.filter((b) => b.section === s) ?? [];
  return (
    <div className="space-y-10">
      <h1 className="font-serif text-display">Homepage images</h1>
      <Block title="Hero slides" hint="Rotating banner at the top. Recommended size 1440×650. Lowest order shows first.">
        {by('HERO').map((b) => <BannerEditor key={b.id} section="HERO" banner={b} />)}
        <p className="text-2xs font-extrabold uppercase">Add a slide</p><BannerEditor section="HERO" />
      </Block>
      <Block title="Editorial banner" hint="Wide banner between the carousels. Only the first active one is shown.">
        {by('EDITORIAL').map((b) => <BannerEditor key={b.id} section="EDITORIAL" banner={b} />)}
        {!by('EDITORIAL').length && <BannerEditor section="EDITORIAL" />}
      </Block>
      <Block title="Shop by colour cards" hint="Portrait cards (about 297×407). Link them to a filtered shop page.">
        {by('COLOUR').map((b) => <BannerEditor key={b.id} section="COLOUR" banner={b} showLabel />)}
        <p className="text-2xs font-extrabold uppercase">Add a card</p><BannerEditor section="COLOUR" showLabel />
      </Block>
    </div>
  );
}