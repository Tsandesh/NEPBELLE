export interface Colour { id: string; slug: string; name: string; hex: string }
export interface Variant { id: string; size: string; stock: number; colourId: string; colourName: string; colourHex: string }
export interface Product {
  id: string; slug: string; name: string; description: string; fabric: string | null;
  priceCents: number; compareAtCents: number | null; currency: string;
  images: string[]; badge: string | null; onSale: boolean;
  categoryId: string; collections: string[];
  category: { slug: string; name: string };
  stockLabel: 'Only Few Left' | 'Sold Out' | null;
  colours: Colour[]; sizes: { size: string; inStock: boolean }[]; variants: Variant[];
}
export interface Category { id: string; slug: string; name: string; imageUrl: string | null }
export interface Facets { sizes: string[]; colours: Colour[]; price: { min: number; max: number } }
export interface ProductFilters {
  category?: string; collection?: 'most-loved' | 'recommended'; q?: string;
  sale?: boolean; sizes?: string[]; colours?: string[]; minPrice?: number; maxPrice?: number;
  sort?: 'newest' | 'price-asc' | 'price-desc'; page?: number; limit?: number;
}

export interface Banner {
  id: string; section: 'HERO' | 'EDITORIAL' | 'COLOUR'; imageUrl: string; alt: string;
  label: string | null; linkUrl: string | null; sortOrder: number; isActive: boolean;
}
export interface HomeContent { hero: Banner[]; editorial: Banner | null; colours: Banner[]; categories: (Category & { imageUrl: string })[] }
