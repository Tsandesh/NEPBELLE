import type { Prisma } from '@prisma/client';
import { prisma } from '../config/db.js';
import { productInclude } from './product.repository.js';
import type { BannerInput, CategoryInput, ProductInput,ColourInput } from '../validators/admin.js';

const skuOf = (slug: string, colourSlug: string, size: string) =>
  `${slug}-${colourSlug}-${size}`.toUpperCase().replace(/[^A-Z0-9]+/g, '-');
const vKey = (v: { colourId: string; size: string }) => `${v.colourId}|${v.size}`;
type SlugMap = Map<string, string>; // colourId -> colour slug (for SKUs)

const fields = (i: ProductInput) => ({
  name: i.name, description: i.description, fabric: i.fabric ?? null, priceCents: i.priceCents,
  compareAtCents: i.compareAtCents ?? null, images: i.images, badge: i.badge ?? null, onSale: i.onSale,
  collections: i.collections, categoryId: i.categoryId,
});

export const adminRepository = {
  // ---- products
  productSlugTaken: (slug: string, exceptId?: string) =>
    prisma.product.findFirst({ where: { slug, ...(exceptId ? { NOT: { id: exceptId } } : {}) }, select: { id: true } }),
  findProduct: (id: string) => prisma.product.findUnique({ where: { id }, include: productInclude }),
  async listProducts({ q, page, limit }: { q?: string; page: number; limit: number }) {
    const where: Prisma.ProductWhereInput = q ? { OR: [{ name: { contains: q, mode: 'insensitive' } }, { slug: { contains: q, mode: 'insensitive' } }] } : {};
    const [items, total] = await prisma.$transaction([
      prisma.product.findMany({ where, include: productInclude, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit }),
      prisma.product.count({ where }),
    ]);
    return { items, total };
  },
    createProduct: (slug: string, i: ProductInput, cs: SlugMap) =>
    prisma.product.create({
      data: {
        ...fields(i), slug,
        variants: { create: i.variants.map((v) => ({ colourId: v.colourId, size: v.size, stock: v.stock, sku: skuOf(slug, cs.get(v.colourId)!, v.size) })) },
      },
      include: productInclude,
    }),
  updateProduct: (id: string, slug: string, i: ProductInput, cs: SlugMap) =>
    prisma.$transaction(async (tx) => {
      const existing = await tx.variant.findMany({ where: { productId: id } });
      const keep = new Set(i.variants.map(vKey));
      const removed = existing.filter((e) => !keep.has(vKey(e))).map((e) => e.id);
      if (removed.length) await tx.variant.deleteMany({ where: { id: { in: removed } } });
      for (const v of i.variants) {
        await tx.variant.upsert({
          where: { productId_size_colourId: { productId: id, size: v.size, colourId: v.colourId } },
          create: { productId: id, colourId: v.colourId, size: v.size, stock: v.stock, sku: skuOf(slug, cs.get(v.colourId)!, v.size) },
          update: { stock: v.stock },
        });
      }
      return tx.product.update({ where: { id }, data: { ...fields(i), slug }, include: productInclude });
    }),
  deleteProduct: (id: string) => prisma.product.delete({ where: { id } }),

  // ---- categories
  findCategory: (id: string) => prisma.category.findUnique({ where: { id }, include: { _count: { select: { products: true } } } }),
  categorySlugTaken: (slug: string, exceptId?: string) =>
    prisma.category.findFirst({ where: { slug, ...(exceptId ? { NOT: { id: exceptId } } : {}) }, select: { id: true } }),
  listCategories: () =>
    prisma.category.findMany({ orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }], include: { _count: { select: { products: true } } } }),
  createCategory: (slug: string, i: CategoryInput) => prisma.category.create({ data: { slug, name: i.name, imageUrl: i.imageUrl ?? null, sortOrder: i.sortOrder } }),
  updateCategory: (id: string, slug: string, i: CategoryInput) =>
    prisma.category.update({ where: { id }, data: { slug, name: i.name, imageUrl: i.imageUrl ?? null, sortOrder: i.sortOrder } }),
  deleteCategory: (id: string) => prisma.category.delete({ where: { id } }),

  // ---- banners
  listBanners: () => prisma.banner.findMany({ orderBy: [{ section: 'asc' }, { sortOrder: 'asc' }] }),
  createBanner: (i: BannerInput) => prisma.banner.create({ data: { ...i, label: i.label ?? null, linkUrl: i.linkUrl ?? null } }),
  updateBanner: (id: string, i: BannerInput) => prisma.banner.update({ where: { id }, data: { ...i, label: i.label ?? null, linkUrl: i.linkUrl ?? null } }),
  deleteBanner: (id: string) => prisma.banner.delete({ where: { id } }),


    // ---- colours
  coloursByIds: (ids: string[]) => prisma.colour.findMany({ where: { id: { in: ids } }, select: { id: true, slug: true } }),
  findColour: (id: string) => prisma.colour.findUnique({ where: { id }, include: { _count: { select: { variants: true } } } }),
  colourSlugTaken: (slug: string, exceptId?: string) =>
    prisma.colour.findFirst({ where: { slug, ...(exceptId ? { NOT: { id: exceptId } } : {}) }, select: { id: true } }),
  colourNameTaken: (name: string, exceptId?: string) =>
    prisma.colour.findFirst({ where: { name: { equals: name, mode: 'insensitive' }, ...(exceptId ? { NOT: { id: exceptId } } : {}) }, select: { id: true } }),
  listColours: () =>
    prisma.colour.findMany({ orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }], include: { _count: { select: { variants: true } } } }),
  createColour: (slug: string, i: ColourInput) => prisma.colour.create({ data: { slug, name: i.name, hex: i.hex, sortOrder: i.sortOrder } }),
  updateColour: (id: string, slug: string, i: ColourInput) => prisma.colour.update({ where: { id }, data: { slug, name: i.name, hex: i.hex, sortOrder: i.sortOrder } }),
  deleteColour: (id: string) => prisma.colour.delete({ where: { id } }),
};