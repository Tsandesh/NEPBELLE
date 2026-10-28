# Nepbelle — e-commerce (React + Express + PostgreSQL + Redis)

Figma source: `cMTxFMvLhwZmpr0KjFkfzN` (file name "BELLEBLUE", UI copy says **NEPBELLE**).

## Run it
```bash
npm install                         # installs client + server workspaces
npm run db:up                       # Postgres 16 + Redis 7 via docker compose
cp server/.env.example server/.env  # set real JWT secrets
npm run -w server prisma:migrate -- --name init
npm run db:seed                     # demo login: demo@nepbelle.test / Password123!
npm run assets                      # download Figma images/icons -> client/public/assets/figma
npm run dev                         # API :4000, web :5173 (proxied /api)
```
**Fonts:** Abhaya Libre loads from Google Fonts. **Sansation** is not on Google Fonts — download it and place `Sansation-Regular.woff2` in `client/public/fonts/`.

## Architecture
```
server/src  config · routes → controllers → services → repositories(Prisma) · middlewares · validators(Zod) · utils
client/src  components/{ui,common} · features/{catalog,cart,auth,checkout,orders,wishlist}/{components,hooks,services,types}
            layouts · pages · routes(router, guards) · services(api, queryClient) · store(zustand) · utils
```
- **Auth:** JWT access (15m, memory) + rotating refresh token (httpOnly cookie, `jti` tracked in Redis; reuse is rejected). Client interceptor refreshes once on 401.
- **Redis:** refresh-session store, fixed-window rate limiting (global 300/min, auth 10/15min, orders, tracking; fails open), product list/detail/facet cache-aside with namespace-version invalidation (bumped on stock change).
- **Orders:** transactional stock decrement (`updateMany … stock >= qty`), cart cleared in the same transaction, timeline events for tracking.
- **Guest cart:** adding while logged out stores the variant locally, sends the user to login, and merges into the server cart afterwards.
- **Design tokens:** Figma values → CSS variables (`client/src/index.css`) → Tailwind theme (`tailwind.config.ts`) → shadcn-style primitives.

## Fidelity status — read this
| Area | Source | Status |
|---|---|---|
| Colours, type, Button/Input/Checkbox/SizeToggle/ColourSwatch states | UI States Board `9:30269` | **Implemented from design context** |
| Home desktop, Header, Footer, ProductCard (028–037) | `7:946` | **Implemented from design context** |
| PLP, Search, PDP, Quick view, Bag drawer, Cart, Checkout ×2, Receipt, Empty cart, Profile, Orders, Wishlist, Mobile home | see map below | **Structure + tokens only — not yet pixel-matched.** Pull each node with `get_design_context` and adjust spacing/layout. |
| Size chart values, payment options, shipping rules | — | **Placeholders** (flagged in code) |
| Logo | `Nav/Logo` returned no asset | Text wordmark placeholder |

### Figma node map
`01.1 Home 7:946` · `01.2 Search 9:28828` · `01.3 PLP 7:2443` · `01.4 Home mobile 1:3` · `02.1 PDP 1:2898` · `02.2 Add to cart drawer 9:29073` · `02.3 Quick view 7:2846` · `02.4 Size chart 7:3292` · `03.1 Cart 7:260` · `03.2 Shipping 9:29206` · `03.3 Payment 9:29380` · `03.4 Receipt 9:29562` · `03.5 Empty cart 7:2` · `03.6 Full form 7:560` · `04.1 Profile 9:29715` · `04.2 Orders 9:29895` · `04.3 Wishlist 9:30077` · Components `9:30595`

## Known gaps / assumptions
- Not installed or run in the authoring sandbox (no network): **run `npm run typecheck -w server -w client` first** and expect small fixes.
- Payment is a stub (`payment.service.ts`); integrate Stripe PaymentIntents + hosted fields. No card data touches the API.
- Shipping: AU$10 flat, free over AU$200 (`utils/pricing.ts`) — not in the design.
- Checkout requires login (no guest checkout). Category-grid / shop-by-colour link targets are inferred (artwork has no text).
- Figma asset URLs expire ~7 days after generation; re-run `get_design_context` to refresh `scripts/fetch-figma-assets.sh` if downloads 404.
- Mobile/responsive: breakpoints are scaffolded; the mobile frame (`1:3`) hasn't been matched.
- No tests yet.
