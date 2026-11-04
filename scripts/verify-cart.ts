/**
 * Deterministic regression test for the "cart empties when I add to it" bug.
 *
 * Run with:  npx tsx scripts/verify-cart.ts
 *
 * No test runner and no browser required. It replays the exact sequence React
 * performs on a page load — effects run in declaration order — against the real
 * production helpers in `src/lib/cart-merge.ts`.
 *
 * The original bug: the persistence effect is declared BEFORE the hydration
 * effect, so on mount it wrote the empty initial cart over the saved basket
 * before hydration ever got to read it. From then on the only source of truth
 * was the server cookie, and when that cookie was blocked the cart read empty.
 */
import assert from "node:assert/strict";
import {
  EMPTY_CART,
  authoritativeAfterSync,
  cartSignature,
  mergeCarts,
  readStoredCart,
  reconcileAfterWrite,
  shouldPersist,
  summarise,
  writeStoredCart,
  type CartLine,
  type CartSummary,
} from "../src/lib/cart-merge";

let passed = 0;
function test(name: string, fn: () => void) {
  fn();
  passed += 1;
  console.log(`  ✓ ${name}`);
}

/** Minimal Storage stand-in. */
function memoryStorage(): Storage & { raw: () => string | null } {
  let value: string | null = null;
  return {
    getItem: () => value,
    setItem: (_k: string, v: string) => {
      value = String(v);
    },
    removeItem: () => {
      value = null;
    },
    key: () => null,
    length: 0,
    clear: () => {
      value = null;
    },
    raw: () => value,
  } as unknown as Storage & { raw: () => string | null };
}

function line(productId: number, priceCents = 100000, quantity = 1): CartLine {
  return {
    productId,
    slug: `work-${productId}`,
    title: `Work ${productId}`,
    artistName: "Artist",
    artistSlug: "artist",
    image: "/art/terra-riverbed.jpg",
    priceCents,
    quantity,
    stock: 1,
    lineTotalCents: priceCents * quantity,
    medium: "Painting",
    dimensions: "100 × 100 cm",
    editionLabel: "Unique work",
  };
}

const storage = memoryStorage();

console.log("\nOchre & Ash — cart regression suite\n");

/* ------------------------------------------------------------------ *
 * 1. THE BUG: page-load mount order must not destroy the saved cart  *
 * ------------------------------------------------------------------ */
test("a saved basket survives React's mount order (the reported bug)", () => {
  // Previous session left a basket behind.
  writeStoredCart(storage, summarise([line(1), line(2, 24000, 2)]));
  const before = readStoredCart(storage);
  assert.equal(before?.itemCount, 3);

  // --- React mounts the provider. Effects fire in declaration order. ---
  // 1st: the ref-sync effect (no storage interaction).
  let cart = EMPTY_CART;
  const cartRef = { current: cart };

  // 2nd: the persistence effect, with `hydrated` still false.
  const persistedEarly = shouldPersist(cart, false);
  if (persistedEarly) writeStoredCart(storage, cart);

  // 3rd: the hydration effect reads storage…
  const local = readStoredCart(storage);
  assert.ok(local, "storage still holds the basket");
  assert.equal(local.itemCount, 3);
  // …and only then does `hydrated` flip true, allowing writes.
  assert.equal(persistedEarly, false, "must not write before hydration");
  assert.equal(shouldPersist(cart, true), true);

  cartRef.current = local;
  cart = local;

  // Post-hydration write of the same basket is harmless.
  writeStoredCart(storage, cart);
  assert.equal(readStoredCart(storage)?.itemCount, 3);
});

test("an empty cart is never written over a saved one", () => {
  writeStoredCart(storage, summarise([line(7)]));
  // Old (buggy) behaviour: unconditional write of EMPTY on mount.
  writeStoredCart(storage, EMPTY_CART);
  assert.equal(readStoredCart(storage), null, "old code destroyed the basket here");

  // New behaviour: the write is skipped entirely.
  writeStoredCart(storage, summarise([line(7)]));
  if (shouldPersist(EMPTY_CART, false)) writeStoredCart(storage, EMPTY_CART);
  assert.equal(readStoredCart(storage)?.itemCount, 1);
});

test("a deliberate clear() still persists once hydrated", () => {
  writeStoredCart(storage, summarise([line(3)]));
  assert.equal(shouldPersist(EMPTY_CART, true), true);
  writeStoredCart(storage, EMPTY_CART);
  assert.equal(readStoredCart(storage), null);
});

/* ------------------------------------------------------------------ *
 * 2. The server must never be able to empty a non-empty local cart   *
 * ------------------------------------------------------------------ */
test("an empty server cart does not erase a non-empty local cart", () => {
  const local = summarise([line(1), line(2)]);
  const merged = mergeCarts(EMPTY_CART, local);
  assert.equal(merged.itemCount, 2);
  assert.equal(merged.subtotalCents, local.subtotalCents);
});

test("a stale/lost cookie is detected and the local lines are kept", () => {
  const local = summarise([line(1), line(5)]);
  // Server only knows about the item just added (fresh cart id, blocked cookie).
  const server: CartSummary = { id: "new-cart", lines: [line(1)], itemCount: 1, subtotalCents: 100000 };
  const { cart, diverged } = reconcileAfterWrite(server, local);
  assert.equal(diverged, true);
  assert.equal(cart.itemCount, 2);
  assert.equal(cart.id, "new-cart");
});

test("server prices win over potentially stale local prices", () => {
  const local = summarise([line(1, 999999)]);
  const server: CartSummary = {
    id: "srv",
    lines: [{ ...line(1, 150000), lineTotalCents: 150000 }],
    itemCount: 1,
    subtotalCents: 150000,
  };
  assert.equal(mergeCarts(server, local).subtotalCents, 150000);
});

test("quantities take the higher of the two sides", () => {
  const local = summarise([line(2, 50000, 3)]);
  const server: CartSummary = {
    id: "srv",
    lines: [{ ...line(2, 50000, 1), lineTotalCents: 50000 }],
    itemCount: 1,
    subtotalCents: 50000,
  };
  assert.equal(mergeCarts(server, local).lines[0].quantity, 3);
});

test("a line present only on the server is adopted", () => {
  const local = summarise([line(1)]);
  const server: CartSummary = {
    id: "srv",
    lines: [{ ...line(9), lineTotalCents: 100000 }],
    itemCount: 1,
    subtotalCents: 100000,
  };
  assert.equal(mergeCarts(server, local).itemCount, 2);
});

/* ------------------------------------------------------------------ *
 * 3. Signature / summarise invariants                                *
 * ------------------------------------------------------------------ */
test("a sync response is authoritative and drops dead lines", () => {
  // A basket saved before the catalogue was reseeded points at a product that
  // no longer exists. The PUT response cannot echo it back, so it must go —
  // otherwise the ghost line lingers and checkout finds nothing to order.
  const stale = summarise([line(9999), line(2)]);
  const echoed: CartSummary = {
    id: "srv",
    lines: [{ ...line(2), lineTotalCents: 100000 }],
    itemCount: 1,
    subtotalCents: 100000,
  };
  const synced = authoritativeAfterSync(echoed, stale);
  assert.equal(synced.lines.length, 1);
  assert.equal(synced.lines[0].productId, 2);
  assert.equal(synced.id, "srv");

  // Whereas a single add keeps lines the server simply has not seen yet.
  const afterAdd = reconcileAfterWrite(echoed, stale);
  assert.equal(afterAdd.cart.lines.length, 2);
});

test("signature detects divergence so the server gets re-pushed", () => {
  const a = summarise([line(1), line(2)]);
  const b = summarise([line(1)]);
  assert.notEqual(cartSignature(a), cartSignature(b));
  assert.equal(cartSignature(a), cartSignature(summarise([line(1), line(2)])));
});

test("zero-quantity lines are dropped, never rendered", () => {
  assert.equal(summarise([line(1, 100, 0), line(2)]).itemCount, 1);
});

test("blocked storage is survivable (read/write are no-ops)", () => {
  assert.equal(readStoredCart(null), null);
  writeStoredCart(null, summarise([line(1)])); // must not throw
});

console.log(`\n  ${passed} tests passed — cart can no longer be emptied on add or reload.\n`);
