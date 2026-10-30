import { z } from 'zod';

// site-relative path or https URL only (blocks javascript:, data:, protocol-relative //)
const safeUrl = z.string().trim().min(1).max(500)
  .refine((u) => (u.startsWith('/') && !u.startsWith('//')) || u.startsWith('https://'), 'Use an uploaded image, a site path, or an https URL.');

const variant = z.object({
  colourId: z.string().min(1),
  size: z.string().trim().min(1).max(10),
  stock: z.number().int().min(0).max(100000),
});

export const colourInputSchema = z.object({
  name: z.string().trim().min(1).max(40),
  slug: z.string().trim().max(40).optional(),
  hex: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Use a hex colour like #b51f2a'),
  sortOrder: z.number().int().min(0).max(1000).default(0),
});
export type ColourInput = z.infer<typeof colourInputSchema>;

export const productInputSchema = z.object({
  name: z.string().trim().min(2).max(160),
  slug: z.string().trim().max(80).optional(),
  description: z.string().trim().min(1).max(5000),
  fabric: z.string().trim().max(80).nullish(),
  priceCents: z.number().int().min(0).max(10_000_000),
  compareAtCents: z.number().int().min(0).nullish(),
  images: z.array(safeUrl).min(1).max(10),
  badge: z.string().trim().max(40).nullish(),
  onSale: z.boolean().default(false),
  collections: z.array(z.enum(['most-loved', 'recommended'])).default([]),
  categoryId: z.string().min(1),
  variants: z.array(variant).min(1).max(200),
}).superRefine((v, ctx) => {
  if (v.compareAtCents != null && v.compareAtCents <= v.priceCents)
    ctx.addIssue({ code: 'custom', path: ['compareAtCents'], message: 'Compare-at price must be higher than the price.' });
  const seen = new Set<string>();
  for (const x of v.variants) {
// in superRefine
    const k = `${x.colourId}|${x.size}`;
    if (seen.has(k)) ctx.addIssue({ code: 'custom', path: ['variants'], message: 'Duplicate colour/size combination.' });
  }
});
export type ProductInput = z.infer<typeof productInputSchema>;

export const categoryInputSchema = z.object({
  name: z.string().trim().min(1).max(60),
  slug: z.string().trim().max(60).optional(),
  imageUrl: safeUrl.nullish(),
  sortOrder: z.number().int().min(0).max(1000).default(0),
});
export type CategoryInput = z.infer<typeof categoryInputSchema>;

export const bannerInputSchema = z.object({
  section: z.enum(['HERO', 'EDITORIAL', 'COLOUR']),
  imageUrl: safeUrl,
  alt: z.string().trim().max(200).default(''),
  label: z.string().trim().max(60).nullish(),
  linkUrl: safeUrl.nullish(),
  sortOrder: z.number().int().min(0).max(1000).default(0),
  isActive: z.boolean().default(true),
});
export type BannerInput = z.infer<typeof bannerInputSchema>;

export const adminProductQuery = z.object({
  q: z.string().trim().max(100).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});