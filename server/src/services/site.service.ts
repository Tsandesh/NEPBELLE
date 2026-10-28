import { prisma } from '../config/db.js';
import { cached } from '../utils/cache.js';

export const siteService = {
  home: () => cached('site:home', 300, async () => {
    const [banners, categories] = await Promise.all([
      prisma.banner.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } }),
      prisma.category.findMany({ where: { imageUrl: { not: null } }, orderBy: { sortOrder: 'asc' }, take: 6, select: { id: true, slug: true, name: true, imageUrl: true } }),
    ]);
    return {
      hero: banners.filter((b) => b.section === 'HERO'),
      editorial: banners.find((b) => b.section === 'EDITORIAL') ?? null,
      colours: banners.filter((b) => b.section === 'COLOUR'),
      categories,
    };
  }),
};