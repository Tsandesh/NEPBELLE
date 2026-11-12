/**
 * Seed with generated placeholder artwork (no downloaded images needed).
 *
 *   npm run db:seed                    # catalogue + banners + demo shopper/admin + demo orders
 *   SEED_DEMO_ORDERS=0 npm run db:seed # skip the demo orders
 *
 * WARNING: wipes products, colours, categories, banners, carts, wishlists and ORDERS. Users are kept.
 */
import { PrismaClient, type OrderStatus, type PaymentMethod, type PaymentStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { calcShipping } from '../src/utils/pricing.js';
import {
  categorySvg, colourCardSvg, editorialSvg, heroSvg, productSvg, proofSvg, resetPlaceholderFiles,
  shapeForCategory, writePrivate, writePublic, type Shape,
} from './placeholders.js';

const prisma = new PrismaClient();
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'] as const;
const ADMIN_EMAIL = 'admin@nepbelle.test';
const slugOf = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const dollars = (cents: number) => Math.round(cents / 100) * 100; // the design shows whole-dollar prices

// ---------- colours ----------
const BASE_COLOURS: [string, string][] = [
  ['Red', '#b51f2a'], ['Pink', '#d9728f'], ['Purple', '#6b2d7a'], ['Blue', '#2a5d8f'], ['Navy', '#1f2a56'],
  ['Green', '#2f7d4f'], ['Yellow', '#e0b22d'], ['Orange', '#e07a2d'], ['Maroon', '#6e1423'], ['Black', '#1c1c1c'],
  ['Grey', '#8a8a8a'], ['White', '#ffffff'], ['Off-White', '#f2ece0'], ['Ivory', '#f6f1e4'],
  ['Teal', '#1f7a7a'], ['Mustard', '#c99a1b'], ['Peach', '#f2b59b'], ['Lavender', '#b9a6d9'],
];
const COLOUR_NAMES = BASE_COLOURS.map(([n]) => n).filter((n) => n !== 'White'); // plain white reads badly on placeholders

// ---------- categories ----------
const CATEGORIES: { slug: string; name: string; tint: string }[] = [
  { slug: 'lehenga-sets', name: 'Lehenga Set', tint: '#b51f2a' },
  { slug: 'bottomwear', name: 'Bottomwear', tint: '#1f2a56' },
  { slug: 'kurtas-tops', name: 'Kurtas & Tops', tint: '#2a5d8f' },
  { slug: 'straight-suit-sets', name: 'Straight Suit Set', tint: '#2f7d4f' },
  { slug: 'dress-sets', name: 'Dress Set', tint: '#d9728f' },
  { slug: 'fusion-sets', name: 'Indian Fusion Set', tint: '#6b2d7a' },
  { slug: 'anarkali-suit-sets', name: 'Anarkali Suit Sets', tint: '#e07a2d' },
  { slug: 'dresses', name: 'Dresses', tint: '#1f7a7a' },
];

// ---------- products ----------
type Collection = 'most-loved' | 'recommended';
interface Spec {
  name: string; cat: string; price: number; compareAt?: number; colours: string[]; coll?: Collection[];
  badge?: string; sale?: boolean; stock?: 'normal' | 'low' | 'out'; fabric?: string;
}

// The ten products named in the Figma Home design
const SPECS: Spec[] = [
  { name: 'Purple Royal Silk Yoke Design Fusion Set', cat: 'fusion-sets', price: 27100, colours: ['Purple', 'Maroon'], coll: ['most-loved'], stock: 'low', fabric: 'Silk blend' },
  { name: 'Blue Cotton Yoke Design Kalidar Kurta Set', cat: 'kurtas-tops', price: 18100, colours: ['Blue', 'Navy', 'Teal'], coll: ['most-loved'], fabric: 'Cotton' },
  { name: 'Yellow Cotton Floral Printed Anarkali Kurta Set', cat: 'anarkali-suit-sets', price: 19600, colours: ['Yellow', 'Mustard', 'Peach'], coll: ['most-loved'], fabric: 'Cotton' },
  { name: 'Green Viscose Blend Floral Printed Straight Kurta Set', cat: 'straight-suit-sets', price: 13900, colours: ['Green', 'Teal'], coll: ['most-loved'], fabric: 'Viscose blend' },
  { name: 'Off-White Embroidered Polyester Kurta Set', cat: 'kurtas-tops', price: 21100, colours: ['Off-White', 'Ivory'], coll: ['most-loved'], fabric: 'Polyester' },
  { name: 'Black Yarn-Dyed Flared Kurta', cat: 'kurtas-tops', price: 12100, compareAt: 16900, colours: ['Black', 'Grey'], coll: ['recommended'], badge: 'Online Exclusive', sale: true, fabric: 'Cotton' },
  { name: 'Ivory Printed A-Line Kurta', cat: 'kurtas-tops', price: 13900, compareAt: 17900, colours: ['Ivory', 'Pink', 'Peach'], coll: ['recommended'], sale: true, stock: 'low', fabric: 'Cotton' },
  { name: 'Pink Cotton Straight Embroidered Kurta', cat: 'kurtas-tops', price: 9000, compareAt: 12900, colours: ['Pink', 'Lavender'], coll: ['recommended'], badge: 'Online Exclusive', sale: true, fabric: 'Cotton' },
  { name: 'Navy LIVA Straight Printed Dress', cat: 'dresses', price: 12100, compareAt: 15900, colours: ['Navy', 'Black', 'Red'], coll: ['recommended'], badge: 'Liva', sale: true, fabric: 'Liva' },
  { name: 'Red Chanderi Printed Fitted Lehenga Set', cat: 'lehenga-sets', price: 48700, colours: ['Red', 'Maroon', 'Pink'], coll: ['recommended'], fabric: 'Chanderi' },
];

// ...plus generated variety so filters, pagination and the looping carousels have something to show
const GEN: Record<string, { styles: string[]; fabrics: string[]; price: [number, number] }> = {
  'kurtas-tops': { styles: ['Floral Printed Straight Kurta', 'Block Print Flared Kurta', 'Embroidered A-Line Kurta', 'Chikankari Kurta Top'], fabrics: ['Cotton', 'Rayon', 'Linen Blend', 'Georgette'], price: [7900, 16900] },
  'straight-suit-sets': { styles: ['Printed Straight Suit Set', 'Embroidered Straight Kurta Set', 'Mirror Work Suit Set'], fabrics: ['Cotton', 'Silk Blend', 'Chanderi'], price: [12900, 22900] },
  'anarkali-suit-sets': { styles: ['Floral Anarkali Suit Set', 'Gota Patti Anarkali Set', 'Layered Anarkali Suit Set'], fabrics: ['Georgette', 'Cotton', 'Muslin'], price: [17900, 31900] },
  'lehenga-sets': { styles: ['Embroidered Lehenga Set', 'Printed Fitted Lehenga Set', 'Sequin Lehenga Set'], fabrics: ['Silk', 'Net', 'Velvet'], price: [38900, 74900] },
  'dress-sets': { styles: ['Co-ord Dress Set', 'Tiered Dress Set', 'Jacket Dress Set'], fabrics: ['Cotton', 'Crepe', 'Satin'], price: [14900, 26900] },
  dresses: { styles: ['Printed Maxi Dress', 'Fit and Flare Dress', 'Wrap Midi Dress'], fabrics: ['Viscose', 'Crepe', 'Cotton'], price: [9900, 18900] },
  'fusion-sets': { styles: ['Indo-Western Fusion Set', 'Cape Style Fusion Set', 'Draped Skirt Fusion Set'], fabrics: ['Silk Blend', 'Georgette', 'Satin'], price: [19900, 36900] },
  bottomwear: { styles: ['Wide Leg Palazzo', 'Straight Fit Pants', 'Printed Sharara', 'Cotton Salwar'], fabrics: ['Cotton', 'Rayon', 'Linen', 'Crepe'], price: [4900, 10900] },
};

let n = 0;
for (const [cat, g] of Object.entries(GEN)) {
  g.styles.forEach((style, si) => {
    n++;
    const first = COLOUR_NAMES[(n * 5 + si) % COLOUR_NAMES.length];
    const extras = [COLOUR_NAMES[(n * 7 + 3) % COLOUR_NAMES.length], COLOUR_NAMES[(n * 11 + 6) % COLOUR_NAMES.length]];
    const count = 1 + (n % 3 === 0 ? 1 : 0) + (n % 5 === 0 ? 1 : 0);
    const fabric = g.fabrics[si % g.fabrics.length];
    const price = dollars(g.price[0] + ((g.price[1] - g.price[0]) * ((n * 37) % 100)) / 100);
    const sale = n % 4 === 0;
    SPECS.push({
      name: `${first} ${fabric} ${style}`, cat, price, fabric, sale,
      compareAt: sale ? dollars(price * 1.3) : undefined,
      colours: [...new Set([first, ...extras])].slice(0, count),
      coll: n % 3 === 0 ? ['most-loved'] : n % 3 === 1 ? ['recommended'] : [],
      badge: n % 7 === 0 ? 'Online Exclusive' : n % 11 === 0 ? 'Liva' : n % 9 === 0 ? 'New' : undefined,
      stock: n === 13 ? 'out' : n % 6 === 0 ? 'low' : 'normal',
    });
  });
}

/** Stock per colour/size. "low" leaves only 4 units in total so the "Only Few Left" badge shows; XXL is sold out on the first colour. */
const stockFor = (mode: Spec['stock'], colourIdx: number, size: string, sizeIdx: number) => {
  if (mode === 'out') return 0;
  if (mode === 'low') return colourIdx === 0 && (size === 'S' || size === 'M') ? 2 : 0;
  return size === 'XXL' ? (colourIdx === 0 ? 0 : 3) : 6 + ((sizeIdx + colourIdx) % 5) * 2;
};

// ---------- homepage banners ----------
const HEROES: { hex: string; accent: string; title: string; subtitle: string; cta: string; shapes: [Shape, Shape]; link: string }[] = [
  { hex: '#b51f2a', accent: '#f3bf43', title: 'Desi, your way', subtitle: 'THE NEW SEASON COLLECTION', cta: 'SHOP NOW', shapes: ['lehenga', 'kurta'], link: '/shop' },
  { hex: '#1f5a3d', accent: '#f3bf43', title: 'AW’26 is here', subtitle: 'DISCOVER THE NEW SEASON OF ELEGANCE', cta: 'EXPLORE', shapes: ['dress', 'kurta'], link: '/shop/dresses' },
  { hex: '#6e1423', accent: '#f2b59b', title: 'Festive favourites', subtitle: 'ANARKALIS · LEHENGAS · FUSION SETS', cta: 'SHOP THE EDIT', shapes: ['lehenga', 'dress'], link: '/shop?sale=1' },
];
const COLOUR_CARDS: { name: string; shape: Shape }[] = [
  { name: 'Ivory', shape: 'kurta' }, { name: 'Green', shape: 'dress' }, { name: 'Pink', shape: 'lehenga' }, { name: 'Black', shape: 'bottom' },
];

// ---------- demo orders (so the admin panel looks lived-in) ----------
const FLOW: OrderStatus[] = ['PLACED', 'CONFIRMED', 'PACKED', 'OUT_FOR_DELIVERY', 'DELIVERED'];
const pathTo = (s: OrderStatus): OrderStatus[] =>
  s === 'CANCELLED' ? ['PLACED', 'CANCELLED']
  : s === 'EXCHANGE_REQUESTED' ? [...FLOW, 'EXCHANGE_REQUESTED']
  : s === 'EXCHANGED' ? [...FLOW, 'EXCHANGE_REQUESTED', 'EXCHANGED']
  : FLOW.slice(0, FLOW.indexOf(s) + 1);
const STEP_MS = 3 * 3_600_000;

interface DemoOrder {
  no: string; name: string; phone: string; status: OrderStatus; method: PaymentMethod; pay: PaymentStatus;
  hoursAgo: number; picks: [number, number][]; receipt?: string; courier?: string; tracking?: string; cancel?: string;
}
const DEMO: DemoOrder[] = [
  { no: 'NBDEMO0001', name: 'Priya Sharma', phone: '0412 345 678', status: 'PLACED', method: 'PAYID', pay: 'PROOF_SUBMITTED', hoursAgo: 1, picks: [[0, 1], [1, 1]], receipt: 'CBA482910337' },
  { no: 'NBDEMO0002', name: 'Aisha Khan', phone: '0423 456 789', status: 'PLACED', method: 'COD', pay: 'UNPAID', hoursAgo: 3, picks: [[2, 2]] },
  { no: 'NBDEMO0003', name: 'Maya Patel', phone: '0434 567 890', status: 'CONFIRMED', method: 'PAYID', pay: 'PAID', hoursAgo: 20, picks: [[3, 1]], receipt: 'NAB771204558' },
  { no: 'NBDEMO0004', name: 'Neha Gupta', phone: '0445 678 901', status: 'PACKED', method: 'COD', pay: 'UNPAID', hoursAgo: 30, picks: [[4, 1], [5, 1]] },
  { no: 'NBDEMO0005', name: 'Sara Ahmed', phone: '0456 789 012', status: 'OUT_FOR_DELIVERY', method: 'COD', pay: 'UNPAID', hoursAgo: 48, picks: [[6, 1]], courier: 'Australia Post', tracking: 'AP1234567890' },
  { no: 'NBDEMO0006', name: 'Rina Das', phone: '0467 890 123', status: 'DELIVERED', method: 'PAYID', pay: 'PAID', hoursAgo: 120, picks: [[7, 1]], receipt: 'WBC903317246', courier: 'Sendle', tracking: 'SD998877' },
  { no: 'NBDEMO0007', name: 'Tara Singh', phone: '0478 901 234', status: 'CANCELLED', method: 'PAYID', pay: 'REFUND_DUE', hoursAgo: 60, picks: [[8, 1]], receipt: 'ANZ556120987', cancel: 'Customer changed their mind' },
  { no: 'NBDEMO0008', name: 'Kiran Rao', phone: '0489 012 345', status: 'EXCHANGE_REQUESTED', method: 'COD', pay: 'PAID', hoursAgo: 96, picks: [[9, 1], [10, 1]], courier: 'Australia Post', tracking: 'AP5566778899' },
];

async function seedDemoOrders(userId: string, email: string) {
  const variants = await prisma.variant.findMany({
    where: { size: 'M', stock: { gte: 6 } }, include: { product: true, colour: true }, orderBy: { sku: 'asc' }, take: 16,
  });
  if (variants.length < 11) { console.warn('Not enough in-stock variants for demo orders; skipping.'); return; }

  for (const [idx, o] of DEMO.entries()) {
    const placed = Date.now() - o.hoursAgo * 3_600_000;
    const items = o.picks.map(([vi, quantity]) => {
      const v = variants[vi];
      return { variantId: v.id, productName: v.product.name, productSlug: v.product.slug, productImage: v.product.images[0] ?? '', size: v.size, colourName: v.colour.name, unitPriceCents: v.product.priceCents, quantity };
    });
    const subtotalCents = items.reduce((s, i) => s + i.unitPriceCents * i.quantity, 0);
    const shippingCents = calcShipping(subtotalCents);
    const totalCents = subtotalCents + shippingCents;

    const steps = pathTo(o.status);
    const at = (st: OrderStatus) => { const i = steps.indexOf(st); return i >= 0 ? new Date(placed + i * STEP_MS) : null; };
    const events: { kind: string; status: OrderStatus; note?: string; actor: string; createdAt: Date }[] = steps.map((st, i) => ({
      kind: 'STATUS', status: st, createdAt: new Date(placed + i * STEP_MS),
      actor: i === 0 || st === 'EXCHANGE_REQUESTED' ? 'customer' : ADMIN_EMAIL,
      note: i === 0 ? (o.method === 'PAYID' ? 'Order placed, PayID screenshot uploaded' : 'Order placed, cash on delivery')
        : st === 'CANCELLED' ? o.cancel : st === 'EXCHANGE_REQUESTED' ? 'Need a size up for two items' : undefined,
    }));
    if (o.pay === 'PAID' || o.pay === 'REFUND_DUE') {
      events.push({
        kind: 'PAYMENT', status: steps[steps.length - 1], actor: ADMIN_EMAIL, createdAt: new Date(placed + (steps.length - 1) * STEP_MS + 60_000),
        note: o.method === 'COD' ? 'Cash collected on delivery' : o.pay === 'REFUND_DUE' ? 'Refund due to customer' : 'PayID payment verified',
      });
    }

    const proofFile = o.method === 'PAYID'
      ? writePrivate(`seed-proof-${o.no}.svg`, proofSvg({
          amount: `AU$${(totalCents / 100).toFixed(2)}`, reference: o.no, receipt: o.receipt ?? '',
          when: new Date(placed + 60_000).toLocaleString('en-AU', { dateStyle: 'medium', timeStyle: 'short' }),
        }))
      : null;

    await prisma.order.create({
      data: {
        orderNumber: o.no, userId, email, customerName: o.name, phone: o.phone, status: o.status,
        subtotalCents, shippingCents, totalCents, currency: 'AUD',
        shippingAddress: { fullName: o.name, line1: `${10 + idx * 7} Example Street`, city: 'Sydney', state: 'NSW', postcode: '2000', country: 'AU', phone: o.phone },
        paymentMethod: o.method, paymentStatus: o.pay,
        payidReceiptNumber: o.receipt ?? null, paymentProofFile: proofFile, paymentProofAt: proofFile ? new Date(placed + 60_000) : null,
        courier: o.courier ?? null, trackingNumber: o.tracking ?? null, cancelReason: o.cancel ?? null,
        placedAt: new Date(placed), confirmedAt: at('CONFIRMED'), deliveredAt: at('DELIVERED'),
        items: { create: items }, events: { create: events },
      },
    });
    if (o.status !== 'CANCELLED') {
      for (const it of items) await prisma.variant.update({ where: { id: it.variantId }, data: { stock: { decrement: it.quantity } } });
    }
  }
  console.log(`  ${DEMO.length} demo orders (one in every state)`);
}

// ---------- main ----------
async function main() {
  resetPlaceholderFiles();

  // wipe (children before parents)
  await prisma.notification.deleteMany();
  await prisma.orderEvent.deleteMany(); await prisma.orderItem.deleteMany(); await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany(); await prisma.cart.deleteMany(); await prisma.wishlistItem.deleteMany();
  await prisma.variant.deleteMany(); await prisma.product.deleteMany();
  await prisma.colour.deleteMany(); await prisma.category.deleteMany(); await prisma.banner.deleteMany();

  // colours
  const colours = new Map<string, { id: string; name: string; hex: string; slug: string }>();
  for (const [i, [name, hex]] of BASE_COLOURS.entries()) {
    const slug = slugOf(name);
    const c = await prisma.colour.create({ data: { name, hex, slug, sortOrder: i } });
    colours.set(name, { id: c.id, name, hex, slug });
  }

  // categories (with generated tile artwork)
  const categoryIds = new Map<string, string>();
  for (const [i, c] of CATEGORIES.entries()) {
    const imageUrl = writePublic(`category-${c.slug}.svg`, categorySvg({ name: c.name, hex: c.tint, shape: shapeForCategory(c.slug) }));
    categoryIds.set(c.slug, (await prisma.category.create({ data: { slug: c.slug, name: c.name, imageUrl, sortOrder: i } })).id);
  }

  // products (3 generated views each)
  const usedNames = new Set<string>();
  for (const spec of SPECS) {
    let name = spec.name; let k = 2;
    while (usedNames.has(name)) name = `${spec.name} ${k++}`;
    usedNames.add(name);
    const slug = slugOf(name);

    const primary = colours.get(spec.colours[0]);
    if (!primary) throw new Error(`"${name}" uses unknown colour "${spec.colours[0]}". Add it to BASE_COLOURS.`);
    const shape = shapeForCategory(spec.cat);
    const images = ([0, 1, 2] as const).map((view) => writePublic(`${slug}-${view + 1}.svg`, productSvg({ hex: primary.hex, shape, colourName: primary.name, view })));

    await prisma.product.create({
      data: {
        slug, name, categoryId: categoryIds.get(spec.cat)!, priceCents: spec.price, compareAtCents: spec.compareAt ?? null,
        description: `${name}. Crafted for everyday elegance with a comfortable fit and fine finishing. This is placeholder copy for the demo catalogue.`,
        fabric: spec.fabric ?? 'Cotton blend', images, badge: spec.badge ?? null, onSale: !!spec.sale, collections: spec.coll ?? [],
        variants: { create: spec.colours.flatMap((cn, ci) => {
          const colour = colours.get(cn);
          if (!colour) throw new Error(`"${name}" uses unknown colour "${cn}".`);
          return SIZES.map((size, si) => ({ size, colourId: colour.id, sku: `${slug}-${colour.slug}-${size}`.toUpperCase(), stock: stockFor(spec.stock ?? 'normal', ci, size, si) }));
        }) },
      },
    });
  }

  // homepage banners (3 hero slides so the carousel has something to do)
  await prisma.banner.createMany({
    data: [
      ...HEROES.map((h, i) => ({
        section: 'HERO' as const, sortOrder: i, alt: `${h.title}. ${h.subtitle}`, linkUrl: h.link,
        imageUrl: writePublic(`hero-${i + 1}.svg`, heroSvg(h)),
      })),
      { section: 'EDITORIAL' as const, alt: 'The festive edit: up to 30% off selected styles', linkUrl: '/shop?sale=1', imageUrl: writePublic('editorial.svg', editorialSvg({ title: 'The Festive Edit', subtitle: 'UP TO 30% OFF SELECTED STYLES' })) },
      ...COLOUR_CARDS.map((c, i) => {
        const col = colours.get(c.name)!;
        return { section: 'COLOUR' as const, sortOrder: i, label: c.name, alt: `${c.name} collection`, linkUrl: `/shop?colours=${col.slug}`, imageUrl: writePublic(`colour-${col.slug}.svg`, colourCardSvg({ name: c.name, hex: col.hex, shape: c.shape })) };
      }),
    ],
  });

  // users
  const demo = await prisma.user.upsert({
    where: { email: 'demo@nepbelle.test' }, update: {},
    create: { email: 'demo@nepbelle.test', passwordHash: await bcrypt.hash('Password123!', 12), firstName: 'Demo', lastName: 'Shopper' },
  });
  await prisma.user.upsert({
    where: { email: ADMIN_EMAIL }, update: { role: 'ADMIN' },
    create: { email: ADMIN_EMAIL, passwordHash: await bcrypt.hash('Admin12345!', 12), firstName: 'Admin', lastName: 'User', role: 'ADMIN' },
  });

  // a populated wishlist and bag for the demo shopper
  const sample = await prisma.product.findMany({ take: 3, orderBy: { slug: 'asc' } });
  await prisma.wishlistItem.createMany({ data: sample.map((p) => ({ userId: demo.id, productId: p.id })) });
  const bagVariants = await prisma.variant.findMany({ where: { size: 'L', stock: { gte: 6 } }, orderBy: { sku: 'asc' }, take: 2 });
  if (bagVariants.length) await prisma.cart.create({ data: { userId: demo.id, items: { create: bagVariants.map((v) => ({ variantId: v.id, quantity: 1 })) } } });

  console.log(`Seeded ${SPECS.length} products, ${CATEGORIES.length} categories, ${BASE_COLOURS.length} colours, ${HEROES.length} hero slides.`);
  if (process.env.SEED_DEMO_ORDERS !== '0') await seedDemoOrders(demo.id, demo.email);

  console.log('\nPlaceholder images are in server/uploads/seed (swap any of them from the admin panel).');
  console.log('  Shopper: demo@nepbelle.test / Password123!   (has 2 items in the bag and 3 wishlist items)');
  console.log('  Admin:   admin@nepbelle.test / Admin12345!');
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
