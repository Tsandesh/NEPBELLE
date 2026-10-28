import type { ProductWithRelations } from "../repositories/product.repository.js";

const LOW_STOCK_THRESHOLD = 5;

export const toProductDTO = (p: ProductWithRelations) => {
  const totalStock = p.variants.reduce((n, v) => n + v.stock, 0);
  const colours = [
    ...new Map(
      p.variants.map((v) => [
        v.colourName,
        { name: v.colourName, hex: v.colourHex },
      ]),
    ).values(),
  ];
  const sizeMap = new Map<string, boolean>();
  p.variants.forEach((v) =>
    sizeMap.set(v.size, (sizeMap.get(v.size) ?? false) || v.stock > 0),
  );
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    description: p.description,
    fabric: p.fabric,
    priceCents: p.priceCents,
    compareAtCents: p.compareAtCents,
    currency: "AUD",
    images: p.images,
    badge: p.badge,
    onSale: p.onSale,
    category: p.category,
    categoryId: p.categoryId,
    collections: p.collections,
    // Design shows an "Only Few Left" badge on low-stock cards
    stockLabel:
      totalStock === 0
        ? "Sold Out"
        : totalStock <= LOW_STOCK_THRESHOLD
          ? "Only Few Left"
          : null,
    colours,
    sizes: [...sizeMap].map(([size, inStock]) => ({ size, inStock })),
    variants: p.variants,
  };
};
export type ProductDTO = ReturnType<typeof toProductDTO>;
