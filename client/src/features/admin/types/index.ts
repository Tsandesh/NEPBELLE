import type { Category } from '@/features/catalog/types';

export interface AdminCategory extends Category { sortOrder: number; _count: { products: number } }
export interface CategoryInput { name: string; slug?: string; imageUrl: string | null; sortOrder: number }
export interface BannerInput {
  section: 'HERO' | 'EDITORIAL' | 'COLOUR'; imageUrl: string; alt: string; label: string | null; linkUrl: string | null; sortOrder: number; isActive: boolean;
}
export interface ProductInput {
  name: string; slug?: string; description: string; fabric: string | null; priceCents: number; compareAtCents: number | null;
  images: string[]; badge: string | null; onSale: boolean; collections: string[]; categoryId: string;
  variants: { size: string; colourName: string; colourHex: string; stock: number }[];
}