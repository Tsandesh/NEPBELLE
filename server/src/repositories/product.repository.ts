import { Prisma } from '@prisma/client';
import { prisma } from '../config/db.js';
import type { ProductQuery } from '../validators/index.js';

export const productInclude = {
  variants: { select: { id: true, size: true, stock: true, colour: { select: { id: true, slug: true, name: true, hex: true } } } },
  category: { select: { slug: true, name: true } },
} satisfies Prisma.ProductInclude;

export type ProductWithRelations = Prisma.ProductGetPayload<{ include: typeof productInclude }>;

const buildWhere = (q: ProductQuery): Prisma.ProductWhereInput => ({
  ...(q.category ? { category: { slug: q.category } } : {}),
  ...(q.sale ? { onSale: true } : {}),
  ...(q.collection ? { collections: { has: q.collection } } : {}),
  ...(q.q ? { OR: [{ name: { contains: q.q, mode: 'insensitive' } }, { category: { name: { contains: q.q, mode: 'insensitive' } } }] } : {}),
  ...(q.minPrice !== undefined || q.maxPrice !== undefined
    ? { priceCents: { ...(q.minPrice !== undefined ? { gte: q.minPrice } : {}), ...(q.maxPrice !== undefined ? { lte: q.maxPrice } : {}) } }
    : {}),
  ...(q.sizes || q.colours
    ? { variants: { some: {
        stock: { gt: 0 },
        ...(q.sizes ? { size: { in: q.sizes } } : {}),
        // lowercasing means old links like ?colours=Green keep working
        ...(q.colours ? { colour: { slug: { in: q.colours.map((c) => c.toLowerCase()) } } } : {}),
      } } }
    : {}),
});

const orderBy = (sort: ProductQuery['sort']): Prisma.ProductOrderByWithRelationInput =>
  sort === 'price-asc' ? { priceCents: 'asc' } : sort === 'price-desc' ? { priceCents: 'desc' } : { createdAt: 'desc' };

export const productRepository = {
  async list(q: ProductQuery) {
    const where = buildWhere(q);
    const [items, total] = await prisma.$transaction([
      prisma.product.findMany({ where, include: productInclude, orderBy: orderBy(q.sort), skip: (q.page - 1) * q.limit, take: q.limit }),
      prisma.product.count({ where }),
    ]);
    return { items, total };
  },
  findBySlug: (slug: string) => prisma.product.findUnique({ where: { slug }, include: productInclude }),
  findByIds: (ids: string[]) => prisma.product.findMany({ where: { id: { in: ids } }, include: productInclude }),
   async facets(category?: string) {
    const variantWhere: Prisma.VariantWhereInput = { stock: { gt: 0 }, ...(category ? { product: { category: { slug: category } } } : {}) };
    const order = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
    const [sizeRows, colours, price] = await Promise.all([
      prisma.variant.findMany({ where: variantWhere, distinct: ['size'], select: { size: true } }),
      prisma.colour.findMany({ where: { variants: { some: variantWhere } }, orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }], select: { id: true, slug: true, name: true, hex: true } }),
      prisma.product.aggregate({ _min: { priceCents: true }, _max: { priceCents: true } }),
    ]);
    const sizes = sizeRows.map((s) => s.size).sort((a, b) => order.indexOf(a) - order.indexOf(b));
    return { sizes, colours, price: { min: price._min.priceCents ?? 0, max: price._max.priceCents ?? 0 } };
  },
  categories: () => prisma.category.findMany({ orderBy: { sortOrder: 'asc' } }),
};
