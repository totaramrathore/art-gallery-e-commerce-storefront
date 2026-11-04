# Ochre & Ash Gallery

A production-ready e-commerce storefront for a Cape Town art gallery — original paintings,
works on paper, ceramics, woven textiles and studio editions, sold to local collectors and
shipped worldwide.

Built with **Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · PostgreSQL ·
Drizzle ORM**.

---

## 1. Quick start

**Prerequisites:** Node.js 20 or newer, and PostgreSQL 14 or newer running locally.

```bash
# 1. install dependencies (exact versions, from the included lockfile)
npm ci            # or: npm install

# 2. point the app at your database
cp .env.example .env
#    then edit DATABASE_URL if your Postgres user/password/port differ

# 3. create the database (skip if it already exists)
createdb app_db
#    or:  psql -U postgres -c "CREATE DATABASE app_db;"

# 4. create the tables from the Drizzle schema
npx drizzle-kit push

# 5. load the demo catalogue — 6 artists, 5 collections, 20 works, 46 reviews
npx tsx src/db/seed.ts

# 6. run it
npm run dev       # http://localhost:3000
```

For a production build:

```bash
npm run build
npm run start
```

> **Windows note:** `createdb` / `psql` are only on your PATH if you installed PostgreSQL
> with its tools. In pgAdmin or DBeaver, simply run `CREATE DATABASE app_db;`.

---

## 2. Verify the cart regression suite

This project ships a deterministic test for the "cart empties when I add to it" bug.
It needs no browser and no test runner:

```bash
npx tsx scripts/verify-cart.ts
```

Expected output ends with:

```
  11 tests passed — cart can no longer be emptied on add or reload.
```

---

## 3. Why `node_modules` is not inside the zip

The archive contains your **complete source, all artwork images, and `package-lock.json`**
for a byte-for-byte reproducible install. Native binaries in the dependency tree
(`@next/swc-*`, `lightningcss`, `esbuild`, `@img/sharp`) are compiled **per operating
system and CPU**, so a `node_modules` folder zipped here would not run on another machine —
it would fail with `ERR_DLOPEN_FAILED` / "invalid ELF header". One `npm ci` builds the
correct binaries for your OS in about a minute and needs no further configuration.

---

## 4. What's inside

```
src/
  app/
    page.tsx                     Home — hero, featured collections, featured works, artists
    shop/page.tsx                Product grid: filters, sorting, search, facet counts
    products/[slug]/page.tsx     Detail: gallery, purchase panel, story, artist, reviews
    collections/…                Collection index + one page per "room"
    artists/page.tsx             The six represented artists
    about/page.tsx               Visit us, hours, FAQ
    checkout/page.tsx            3-step checkout with live order summary
    order/[orderNumber]/page.tsx Order confirmation
    api/cart/route.ts            GET · POST · PATCH · DELETE · PUT (sync)
    api/checkout/route.ts        Creates the order, decrements stock, clears the cart
    api/reviews/route.ts         Posts a review and recomputes the product rating
    api/health/route.ts          Liveness probe used by the platform
  components/
    cart/                        CartProvider (context) + slide-out drawer
    products/                    Product card, gallery, purchase panel, reviews, filters
    site/                        Header, footer
    ui/                          Reveal (scroll animation), Stars
  db/                            Drizzle schema, client, and the seed script
  lib/
    cart.ts                      Server cart: cookie, resolve/replace lines, stock clamping
    cart-merge.ts                Pure cart logic (merge, reconcile, storage) — unit tested
    queries.ts                   All catalogue queries and facets
    format.ts                    Prices, dates, shipping rules, order numbers
    catalog.ts                   Client-safe filter/sort constants
    site.ts                      Gallery name, address, hours, guarantees
scripts/verify-cart.ts           The cart regression suite
public/art/                      All artwork and gallery imagery
```

---

## 5. How the cart works (and why it cannot empty itself)

The basket has **two independent stores and a merge rule**, so losing either one is
recoverable:

1. **The browser** (`localStorage`, key `ochre-cart-v1`) is the durable client-side store.
   It is written only *after* hydration has read it — React runs effects in declaration
   order, and the persistence effect is declared before the hydration effect, so an
   unguarded write would overwrite the saved basket with an empty one on every page load.
   `shouldPersist()` in `src/lib/cart-merge.ts` closes that hole.
2. **The server** (`carts` + `cart_items` tables, keyed to an httpOnly `ochre_cart` cookie)
   is a mirror, kept in step by a debounced `PUT /api/cart`.
3. **Merging is never destructive.** Every server response is merged with
   `mergeCarts()`, which takes the server's prices/stock but keeps any line that exists on
   only one side. An empty server answer therefore cannot erase a non-empty basket.
4. **Checkout is belt-and-braces.** The client syncs first *and* sends its lines with the
   order; the server re-reads every price and stock level from the database, so a blocked
   or missing cookie cannot lose an order.
5. A **mutation sequence number** discards any hydration response that started before your
   click, so a slow `GET /api/cart` can no longer overwrite a just-added item.

The cookie is set `SameSite=None; Secure` over HTTPS (and `Lax` on plain HTTP) so it also
survives being loaded inside a cross-site preview frame.

---

## 6. Seeded catalogue

| Collection | Works | Price range |
|---|---|---|
| Terra & Ochre | 4 | $1,240 – $3,400 |
| Ash & Ink | 4 | $760 – $2,600 |
| Fired Clay | 4 | $420 – $1,480 |
| Woven Light | 4 | $540 – $2,300 |
| Studio Editions | 4 | $180 – $420 |

Prices are stored in cents (`integer`) and rendered with `Intl.NumberFormat`.
Stock is a real column: unique works carry `1`, editions carry their remaining number,
and checkout decrements it inside a transaction.

Re-seed at any time — it wipes and rebuilds the catalogue, orders and carts:

```bash
npx tsx src/db/seed.ts
```

---

## 7. Shipping rules

Defined in `src/lib/format.ts` and enforced server-side at checkout:

| Method | Cost | Notes |
|---|---|---|
| Collect from the gallery | free | 23 Bree Street, ready in 24 h |
| Insured courier — South Africa | $35 | free above $2,500 |
| Insured international express | $180 | free above $4,500, duties included |

---

## 8. Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npx drizzle-kit push` | Apply `src/db/schema.ts` to the database |
| `npx tsx src/db/seed.ts` | Reset and reseed the catalogue |
| `npx tsx scripts/verify-cart.ts` | Cart regression suite |

Payment is a demonstration form — no card is charged and no data leaves the server.
