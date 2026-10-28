// Local copies downloaded by `npm run assets` (scripts/fetch-figma-assets.sh).
const A = '/assets/figma';
export const images = {
  // hero: [`${A}/hero-banner-01.jpg`, `${A}/hero-banner-02.jpg`],
  hero: [1, 2].map((n) => ({ src: `${A}/hero-banner-0${n}.jpg`, alt: `Hero banner ${n}` })),
  editorial: `${A}/editorial.jpg`,
  categories: [1, 2, 3, 4, 5, 6].map((n) => `${A}/category-${n}.png`),
  colours: [1, 2, 3, 4].map((n) => `${A}/color-${n}.png`),
  icons: {
    search: `${A}/icon-search.svg`, heart: `${A}/icon-heart.svg`, bag: `${A}/icon-shopping-bag.svg`, user: `${A}/icon-user.svg`,
    chevronRight: `${A}/icon-chevron-right.svg`, shield: `${A}/icon-shield.svg`,
    facebook: `${A}/icon-facebook.svg`, instagram: `${A}/icon-instagram.svg`, twitter: `${A}/icon-twitter.svg`,
    youtube: `${A}/icon-youtube.svg`, pinterest: `${A}/icon-pinterest.svg`,
  },
};
