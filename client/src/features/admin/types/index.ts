import type { Category } from '@/features/catalog/types';

export interface AdminCategory extends Category { sortOrder: number; _count: { products: number } }
export interface CategoryInput { name: string; slug?: string; imageUrl: string | null; sortOrder: number }
export interface AdminColour { id: string; slug: string; name: string; hex: string; sortOrder: number; _count: { variants: number } }
export interface ColourInput { name: string; slug?: string; hex: string; sortOrder: number }

export interface BannerInput {
  section: 'HERO' | 'EDITORIAL' | 'COLOUR'; imageUrl: string; alt: string; label: string | null; linkUrl: string | null; sortOrder: number; isActive: boolean;
}

export interface Colour { id: string; slug: string; name: string; hex: string }
export interface Variant { id: string; size: string; stock: number; colourId: string; colourName: string; colourHex: string }
export interface ProductInput {
  name: string; slug?: string; description: string; fabric: string | null; priceCents: number; compareAtCents: number | null;
  images: string[]; badge: string | null; onSale: boolean; collections: string[]; categoryId: string;
  variants: { colourId: string; size: string; stock: number }[];
}