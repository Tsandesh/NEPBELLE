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
