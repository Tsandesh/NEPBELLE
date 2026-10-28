import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const img = (n: number) => `/assets/figma/product-${n}.png`;
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

const categories = [
  { slug: 'lehenga-sets', name: 'Lehenga Set', imageUrl: '/assets/figma/category-1.png' },
  { slug: 'bottomwear', name: 'Bottomwear', imageUrl: '/assets/figma/category-2.png' },
  { slug: 'kurtas-tops', name: 'Kurtas & Tops', imageUrl: '/assets/figma/category-3.png' },
  { slug: 'straight-suit-sets', name: 'Straight Suit Set', imageUrl: '/assets/figma/category-4.png' },
  { slug: 'dress-sets', name: 'Dress Set', imageUrl: '/assets/figma/category-5.png' },
  { slug: 'fusion-sets', name: 'Indian Fusion Set', imageUrl: '/assets/figma/category-6.png' },
  { slug: 'anarkali-suit-sets', name: 'Anarkali Suit Sets', imageUrl: null },
  { slug: 'dresses', name: 'Dresses', imageUrl: null },
];

// Names/prices from Home / Desktop (7:946). Sale prices for "Recommended" cards are placeholders where the design only showed one figure.
const products = [
  { slug: 'purple-royal-silk-yoke-design-fusion-set', name: 'Purple Royal Silk Yoke Design Fusion Set', cat: 'fusion-sets', price: 27100, img: 0, col: ['Purple', '#6b2d7a'], coll: ['most-loved'], low: true },
  { slug: 'blue-cotton-yoke-design-kalidar-kurta-set', name: 'Blue Cotton Yoke Design Kalidar Kurta Set', cat: 'kurtas-tops', price: 18100, img: 1, col: ['Blue', '#2a5d8f'], coll: ['most-loved'], low: true },
  { slug: 'yellow-cotton-floral-printed-anarkali-kurta-set', name: 'Yellow Cotton Floral Printed Anarkali Kurta Set', cat: 'anarkali-suit-sets', price: 19600, img: 2, col: ['Yellow', '#e0b22d'], coll: ['most-loved'], low: true },
  { slug: 'green-viscose-blend-floral-printed-straight-kurta-set', name: 'Green Viscose Blend Floral Printed Straight Kurta Set', cat: 'straight-suit-sets', price: 13900, img: 3, col: ['Green', '#2f7d4f'], coll: ['most-loved'] },
  { slug: 'off-white-embroidered-polyester-kurta-set', name: 'Off-White Embroidered Polyester Kurta Set', cat: 'kurtas-tops', price: 21100, img: 4, col: ['Off-White', '#f2ece0'], coll: ['most-loved'] },
  { slug: 'black-yarn-dyed-flared-kurta', name: 'Black Yarn-Dyed Flared Kurta', cat: 'kurtas-tops', price: 12100, compareAt: 16900, img: 5, col: ['Black', '#1c1c1c'], coll: ['recommended'], badge: 'Online Exclusive', sale: true },
  { slug: 'ivory-printed-a-line-kurta', name: 'Ivory Printed A-Line Kurta', cat: 'kurtas-tops', price: 13900, compareAt: 17900, img: 4, col: ['Ivory', '#f6f1e4'], coll: ['recommended'], sale: true, low: true },
  { slug: 'pink-cotton-straight-embroidered-kurta', name: 'Pink Cotton Straight Embroidered Kurta', cat: 'kurtas-tops', price: 9000, compareAt: 12900, img: 6, col: ['Pink', '#d9728f'], coll: ['recommended'], badge: 'Online Exclusive', sale: true },
  { slug: 'navy-liva-straight-printed-dress', name: 'Navy LIVA Straight Printed Dress', cat: 'dresses', price: 12100, compareAt: 15900, img: 1, col: ['Navy', '#1f2a56'], coll: ['recommended'], badge: 'Liva', sale: true },
  { slug: 'red-chanderi-printed-fitted-lehenga-set', name: 'Red Chanderi Printed Fitted Lehenga Set', cat: 'lehenga-sets', price: 48700, img: 7, col: ['Red', '#b51f2a'], coll: ['recommended'] },
];

async function main() {
  await prisma.orderEvent.deleteMany(); await prisma.orderItem.deleteMany(); await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany(); await prisma.cart.deleteMany(); await prisma.wishlistItem.deleteMany();
  await prisma.variant.deleteMany(); await prisma.product.deleteMany(); await prisma.category.deleteMany();

  const cats = new Map<string, string>();
  for (const [i, c] of categories.entries()) cats.set(c.slug, (await prisma.category.create({ data: { ...c, sortOrder: i } })).id);

  for (const p of products) {
    await prisma.product.create({
      data: {
        slug: p.slug, name: p.name, categoryId: cats.get(p.cat)!, priceCents: p.price, compareAtCents: (p as any).compareAt ?? null,
        description: `${p.name}. Crafted for everyday elegance with a comfortable fit and fine finishing.`,
        fabric: 'Cotton blend', images: [img(p.img), img((p.img + 1) % 8)], badge: (p as any).badge ?? null,
        onSale: !!(p as any).sale, collections: p.coll,
        variants: { create: SIZES.map((size, i) => ({
          size, colourName: p.col[0], colourHex: p.col[1], sku: `${p.slug.slice(0, 18)}-${p.col[0]}-${size}`.toUpperCase(),
          stock: p.low ? (i < 2 ? 2 : 0) : size === 'XXL' ? 0 : 12,
        })) },
      },
    });
  }

  await prisma.user.upsert({
    where: { email: 'demo@nepbelle.test' }, update: {},
    create: { email: 'demo@nepbelle.test', passwordHash: await bcrypt.hash('Password123!', 12), firstName: 'Demo', lastName: 'Shopper' },
  });
  console.log('Seeded. Demo login: demo@nepbelle.test / Password123!');
}

main().finally(() => prisma.$disconnect());
