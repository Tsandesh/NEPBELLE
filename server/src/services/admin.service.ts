import { AppError } from '../utils/AppError.js';
import { invalidateProductCache } from '../utils/cache.js';
import { slugify } from '../utils/slugify.js';
import { adminRepository as repo } from '../repositories/admin.repository.js';
import type { BannerInput, CategoryInput, ProductInput,ColourInput } from '../validators/admin.js';
import { toProductDTO } from './mappers.js';

const uniqueSlug = async (base: string, taken: (s: string) => Promise<unknown>, fallback: string) => {
  const root = base || fallback;
  let slug = root, n = 1;
  while (await taken(slug)) slug = `${root}-${++n}`;
  return slug;
};
const bust = () => invalidateProductCache(); // bumps the Redis namespace: product, category and home caches refresh

const colourSlugs = async (variants: { colourId: string }[]) => {
  const ids = [...new Set(variants.map((v) => v.colourId))];
  const found = await repo.coloursByIds(ids);
  if (found.length !== ids.length) throw AppError.badRequest('One or more colours do not exist.');
  return new Map(found.map((c) => [c.id, c.slug]));
};
const assertColourNameFree = async (name: string, exceptId?: string) => {
  if (await repo.colourNameTaken(name, exceptId)) throw AppError.conflict('A colour with this name already exists.');
};

export const adminService = {
  // ---- products
  async listProducts(q: { q?: string; page: number; limit: number }) {
    const { items, total } = await repo.listProducts(q);
    return { items: items.map(toProductDTO), meta: { page: q.page, limit: q.limit, total, totalPages: Math.max(1, Math.ceil(total / q.limit)) } };
  },
  async getProduct(id: string) {
    const p = await repo.findProduct(id);
    if (!p) throw AppError.notFound('Product not found');
    return toProductDTO(p);
  },
    async createProduct(input: ProductInput) {
    if (!(await repo.findCategory(input.categoryId))) throw AppError.badRequest('Category does not exist.');
    const cs = await colourSlugs(input.variants);
    const slug = await uniqueSlug(slugify(input.slug || input.name), (s) => repo.productSlugTaken(s), 'product');
    const p = await repo.createProduct(slug, input, cs);
    await bust();
    return toProductDTO(p);
  },
  async updateProduct(id: string, input: ProductInput) {
    const existing = await repo.findProduct(id);
    if (!existing) throw AppError.notFound('Product not found');
    if (!(await repo.findCategory(input.categoryId))) throw AppError.badRequest('Category does not exist.');
    const cs = await colourSlugs(input.variants);
    const slug = input.slug ? await uniqueSlug(slugify(input.slug), (s) => repo.productSlugTaken(s, id), 'product') : existing.slug;
    const p = await repo.updateProduct(id, slug, input, cs);
    await bust();
    return toProductDTO(p);
  },

  // ---- colours
  listColours: () => repo.listColours(),
  async createColour(i: ColourInput) {
    await assertColourNameFree(i.name);
    const slug = await uniqueSlug(slugify(i.slug || i.name), (s) => repo.colourSlugTaken(s), 'colour');
    const c = await repo.createColour(slug, i); await bust(); return c;
  },
  async updateColour(id: string, i: ColourInput) {
    const existing = await repo.findColour(id);
    if (!existing) throw AppError.notFound('Colour not found');
    await assertColourNameFree(i.name, id);
    const slug = i.slug ? await uniqueSlug(slugify(i.slug), (s) => repo.colourSlugTaken(s, id), 'colour') : existing.slug;
    const c = await repo.updateColour(id, slug, i); await bust(); return c;
  },
  async deleteColour(id: string) {
    const c = await repo.findColour(id);
    if (!c) throw AppError.notFound('Colour not found');
    if (c._count.variants > 0) throw AppError.conflict(`This colour is used by ${c._count.variants} product variant(s). Remove it from those products first.`);
    await repo.deleteColour(id); await bust();
  },
  async deleteProduct(id: string) { await repo.deleteProduct(id); await bust(); },

  // ---- categories
  listCategories: () => repo.listCategories(),
  async createCategory(i: CategoryInput) {
    const slug = await uniqueSlug(slugify(i.slug || i.name), (s) => repo.categorySlugTaken(s), 'category');
    const c = await repo.createCategory(slug, i); await bust(); return c;
  },
  async updateCategory(id: string, i: CategoryInput) {
    const existing = await repo.findCategory(id);
    if (!existing) throw AppError.notFound('Category not found');
    const slug = i.slug ? await uniqueSlug(slugify(i.slug), (s) => repo.categorySlugTaken(s, id), 'category') : existing.slug;
    const c = await repo.updateCategory(id, slug, i); await bust(); return c;
  },
  async deleteCategory(id: string) {
    const c = await repo.findCategory(id);
    if (!c) throw AppError.notFound('Category not found');
    if (c._count.products > 0) throw AppError.conflict(`Move or delete its ${c._count.products} product(s) first.`);
    await repo.deleteCategory(id); await bust();
  },

  // ---- banners
  listBanners: () => repo.listBanners(),
  async createBanner(i: BannerInput) { const b = await repo.createBanner(i); await bust(); return b; },
  async updateBanner(id: string, i: BannerInput) { const b = await repo.updateBanner(id, i); await bust(); return b; },
  async deleteBanner(id: string) { await repo.deleteBanner(id); await bust(); },

  
};