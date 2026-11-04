/**
 * Pure, dependency-free cart logic shared by the React provider and the
 * `scripts/verify-cart.ts` regression script. Nothing in here touches React,
 * the network or the DOM — which is what makes the ordering contract testable.
 */

export type CartLine = {
  productId: number;
  slug: string;
  title: string;
  artistName: string;
  artistSlug: string;
  image: string;
  priceCents: number;
  quantity: number;
  stock: number;
  lineTotalCents: number;
  medium: string;
  dimensions: string;
  editionLabel: string;
};

export type CartSummary = {
  id: string | null;
  lines: CartLine[];
  itemCount: number;
  subtotalCents: number;
};

export const EMPTY_CART: CartSummary = { id: null, lines: [], itemCount: 0, subtotalCents: 0 };

export const CART_STORAGE_KEY = "ochre-cart-v1";

export function summarise(lines: CartLine[], id: string | null = null): CartSummary {
  const safeLines = lines.filter((line) => line.quantity > 0);
  return {
    id,
    lines: safeLines,
    itemCount: safeLines.reduce((sum, line) => sum + line.quantity, 0),
    subtotalCents: safeLines.reduce((sum, line) => sum + line.priceCents * line.quantity, 0),
  };
}

/**
 * Whether the basket may be written to the browser store.
 *
 * React runs effects in declaration order and the persistence effect is declared
 * BEFORE the hydration effect. On a fresh page load it would therefore fire with
 * the empty initial cart and overwrite the saved basket. Hydration flips this
 * flag only once storage has been read, so the write is suppressed until then.
 */
export function shouldPersist(_cart: CartSummary, hydrated: boolean): boolean {
  return hydrated;
}

export function readStoredCart(storage: Storage | null): CartSummary | null {
  if (!storage) return null;
  try {
    const raw = storage.getItem(CART_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { lines?: CartLine[] };
    if (!Array.isArray(parsed.lines) || parsed.lines.length === 0) return null;
    return summarise(parsed.lines);
  } catch {
    return null;
  }
}

export function writeStoredCart(storage: Storage | null, cart: CartSummary): void {
  if (!storage) return;
  try {
    storage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch {
    /* private mode / blocked storage — the server mirror still applies */
  }
}

/**
 * Union of two carts. Server metadata (price, title, stock) always wins, but a
 * line that exists only on one side is kept — so a lost cookie or a stale server
 * row can never make a basket disappear.
 */
export function mergeCarts(server: CartSummary, local: CartSummary): CartSummary {
  const byId = new Map<number, CartLine>();

  for (const line of local.lines) {
    byId.set(line.productId, { ...line });
  }

  for (const line of server.lines) {
    const existing = byId.get(line.productId);
    byId.set(line.productId, {
      ...line,
      quantity: Math.max(line.quantity, existing?.quantity ?? 0),
    });
  }

  const lines = [...byId.values()].map((line) => ({
    ...line,
    lineTotalCents: line.priceCents * line.quantity,
  }));

  return summarise(lines, server.id);
}

/**
 * After a write, the server answer is authoritative for anything it knows about.
 * Anything the client holds that the server did not echo back (a blocked cookie,
 * for instance) is retained locally and flagged so the caller can re-push it.
 */
export function reconcileAfterWrite(
  server: CartSummary,
  local: CartSummary,
): { cart: CartSummary; diverged: boolean } {
  const serverIds = new Set(server.lines.map((line) => line.productId));
  const extras = local.lines.filter((line) => !serverIds.has(line.productId));
  const lines = [...server.lines, ...extras.map((line) => ({ ...line }))];
  return { cart: summarise(lines, server.id ?? local.id), diverged: extras.length > 0 };
}

/**
 * After a full push the server has seen every line we hold, so its answer is
 * authoritative. A line it did not echo back has sold out or no longer exists
 * and must be dropped — otherwise a line saved before a catalogue change could
 * linger in the basket forever and block checkout. Quantities are likewise the
 * server's, because it is the only side that knows the real stock.
 */
export function authoritativeAfterSync(server: CartSummary, _local: CartSummary): CartSummary {
  return summarise(server.lines, server.id);
}

/** Stable identity used to decide whether the server needs to be re-pushed. */
export function cartSignature(cart: CartSummary): string {
  return cart.lines.map((line) => `${line.productId}:${line.quantity}`).join(",");
}
