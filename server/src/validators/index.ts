import { z } from 'zod';

const email = z.string().trim().toLowerCase().email('Enter a valid email address.');
const password = z.string().min(8, 'Use at least 8 characters.').max(72);

export const registerSchema = z.object({
  email, password,
  firstName: z.string().trim().min(1).max(60),
  lastName: z.string().trim().min(1).max(60),
});
export const loginSchema = z.object({ email, password: z.string().min(1) });

export const productQuerySchema = z.object({
  category: z.string().optional(),
  collection: z.enum(['most-loved', 'recommended']).optional(),
  q: z.string().trim().max(100).optional(),
  sale: z.coerce.boolean().optional(),
  sizes: z.string().optional().transform((v) => (v ? v.split(',') : undefined)),
  colours: z.string().optional().transform((v) => (v ? v.split(',') : undefined)),
  minPrice: z.coerce.number().int().min(0).optional(),
  maxPrice: z.coerce.number().int().min(0).optional(),
  sort: z.enum(['newest', 'price-asc', 'price-desc']).default('newest'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(48).default(12),
});
export type ProductQuery = z.infer<typeof productQuerySchema>;

export const slugParam = z.object({ slug: z.string().min(1) });
export const idParam = z.object({ id: z.string().min(1) });

export const addCartItemSchema = z.object({
  variantId: z.string().min(1),
  quantity: z.number().int().min(1).max(10).default(1),
});
export const updateCartItemSchema = z.object({ quantity: z.number().int().min(1).max(10) });
export const mergeCartSchema = z.object({
  items: z.array(z.object({ variantId: z.string(), quantity: z.number().int().min(1).max(10) })).max(50),
});

export const addressSchema = z.object({
  fullName: z.string().trim().min(1),
  line1: z.string().trim().min(1),
  line2: z.string().trim().optional(),
  city: z.string().trim().min(1),
  state: z.string().trim().min(1),
  postcode: z.string().trim().min(3).max(10),
  country: z.string().trim().length(2).default('AU'),
  phone: z.string().trim().min(6),
  isDefault: z.boolean().optional(),
});

export const updateProfileSchema = z.object({
  firstName: z.string().trim().min(1).max(60).optional(),
  lastName: z.string().trim().min(1).max(60).optional(),
  phone: z.string().trim().max(30).optional(),
});

export const placeOrderSchema = z.object({
  shippingAddress: addressSchema.omit({ isDefault: true }),
  saveAddress: z.boolean().optional(),
  // ASSUMPTION: payment options are placeholders until the Payment screen (9:29380) is mapped.
  paymentMethod: z.enum(['card', 'cod']),
});

export const trackOrderSchema = z.object({ orderNumber: z.string().min(4), email });
