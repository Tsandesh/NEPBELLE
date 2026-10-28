export const SectionHeader = ({ title, size = 'md' }: { title: string; size?: 'md' | 'lg' }) => (
  <div className={`flex justify-center ${size === 'lg' ? 'pb-8' : 'pb-6'}`}>
    <h2 className={`font-serif font-medium uppercase text-ink ${size === 'lg' ? 'text-display tracking-[1px]' : 'text-title'}`}>{title}</h2>
  </div>
);
