import { cookies, headers } from "next/headers";
import { and, asc, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import { artists, cartItems, carts, products } from "@/db/schema";

export const CART_COOKIE = "ochre_cart";
const MAX_AGE = 60 * 60 * 24 * 180;

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

export const EMPTY_CART: CartSummary = {
  id: null,
  lines: [],
  itemCount: 0,
  subtotalCents: 0,
};

export async function readCartId(): Promise<string | null> {
  const store = await cookies();
  return store.get(CART_COOKIE)?.value ?? null;
}

/**
 * Only callable from a route handler or server action (writes a cookie).
 *
 * The cookie is marked `SameSite=None; Secure` whenever the request arrives over
 * HTTPS so that it also survives being loaded inside a cross-site preview frame,
 * where `SameSite=Lax` cookies are silently dropped by the browser.
 */
export async function ensureCartId(): Promise<string> {
  const store = await cookies();
  const existing = store.get(CART_COOKIE)?.value;

  if (existing) {
    const found = await db
      .select({ id: carts.id })
      .from(carts)
      .where(eq(carts.id, existing))
      .limit(1);
    if (found.length) return existing;
  }

  const secure = (await headers()).get("x-forwarded-proto") === "https";

  const id = crypto.randomUUID();
  await db.insert(carts).values({ id }).onConflictDoNothing();
  store.set(CART_COOKIE, id, {
    httpOnly: true,
    sameSite: secure ? "none" : "lax",
    secure,
    path: "/",
    maxAge: MAX_AGE,
  });
  return id;
}

export async function loadCart(cartId: string | null): Promise<CartSummary> {
  if (!cartId) return EMPTY_CART;

  const rows = await db
    .select({
      productId: products.id,
      slug: products.slug,
      title: products.title,
      artistName: artists.name,
      artistSlug: artists.slug,
      image: products.image,
      priceCents: products.priceCents,
      quantity: cartItems.quantity,
      stock: products.stock,
      medium: products.medium,
      dimensions: products.dimensions,
      editionLabel: products.editionLabel,
    })
    .from(cartItems)
    .innerJoin(products, eq(cartItems.productId, products.id))
    .innerJoin(artists, eq(products.artistId, artists.id))
    .where(eq(cartItems.cartId, cartId))
    .orderBy(asc(cartItems.createdAt), asc(cartItems.id));

  // Sold-out works fall out of the cart rather than blocking checkout.
  const lines: CartLine[] = rows
    .filter((row) => row.stock > 0)
    .map((row) => ({
      ...row,
      quantity: Math.min(row.quantity, row.stock),
      lineTotalCents: row.priceCents * Math.min(row.quantity, row.stock),
    }));

  return {
    id: cartId,
    lines,
    itemCount: lines.reduce((sum, line) => sum + line.quantity, 0),
    subtotalCents: lines.reduce((sum, line) => sum + line.lineTotalCents, 0),
  };
}

export async function getCart(): Promise<CartSummary> {
  return loadCart(await readCartId());
}

export type CartLineInput = { productId: number; quantity: number };

/**
 * Turns an untrusted list of `{ productId, quantity }` into real cart lines by
 * re-reading every product from the database. Prices, titles and stock always
 * come from the server — never from the client payload.
 */
export async function resolveLines(inputs: CartLineInput[]): Promise<CartLine[]> {
  const ids = [
    ...new Set(
      inputs
        .map((input) => Number(input?.productId))
        .filter((id) => Number.isInteger(id) && id > 0),
    ),
  ];

  if (!ids.length) return [];

  const rows = await db
    .select({
      productId: products.id,
      slug: products.slug,
      title: products.title,
      artistName: artists.name,
      artistSlug: artists.slug,
      image: products.image,
      priceCents: products.priceCents,
      stock: products.stock,
      medium: products.medium,
      dimensions: products.dimensions,
      editionLabel: products.editionLabel,
    })
    .from(products)
    .innerJoin(artists, eq(products.artistId, artists.id))
    .where(inArray(products.id, ids));

  const byId = new Map(rows.map((row) => [row.productId, row]));
  const lines: CartLine[] = [];

  for (const input of inputs) {
    const product = byId.get(Number(input?.productId));
    if (!product || product.stock <= 0) continue;

    const requested = Math.max(1, Math.floor(Number(input?.quantity) || 1));
    const existing = lines.find((line) => line.productId === product.productId);

    if (existing) {
      existing.quantity = Math.min(existing.quantity + requested, product.stock);
      existing.lineTotalCents = existing.priceCents * existing.quantity;
    } else {
      const quantity = Math.min(requested, product.stock);
      lines.push({
        ...product,
        quantity,
        lineTotalCents: product.priceCents * quantity,
      });
    }
  }

  return lines;
}

/** Replaces the server cart with exactly the supplied lines (validated + re-priced). */
export async function replaceCartLines(
  cartId: string,
  inputs: CartLineInput[],
): Promise<CartSummary> {
  const lines = await resolveLines(inputs);

  await db.transaction(async (tx) => {
    await tx.delete(cartItems).where(eq(cartItems.cartId, cartId));
    if (lines.length) {
      await tx.insert(cartItems).values(
        lines.map((line) => ({
          cartId,
          productId: line.productId,
          quantity: line.quantity,
        })),
      );
    }
  });

  await db.update(carts).set({ updatedAt: new Date() }).where(eq(carts.id, cartId));

  return {
    id: cartId,
    lines,
    itemCount: lines.reduce((sum, line) => sum + line.quantity, 0),
    subtotalCents: lines.reduce((sum, line) => sum + line.lineTotalCents, 0),
  };
}

export async function addCartItem(
  cartId: string,
  productId: number,
  quantity = 1,
): Promise<void> {
  const product = await db
    .select({ id: products.id, stock: products.stock })
    .from(products)
    .where(eq(products.id, productId))
    .limit(1);

  if (!product.length) throw new Error("Product not found");

  const max = Math.max(product[0].stock, 0);
  if (max === 0) throw new Error("This work has been sold");

  const desired = Math.max(1, Math.min(quantity, max));

  await db
    .insert(cartItems)
    .values({ cartId, productId, quantity: desired })
    .onConflictDoUpdate({
      target: [cartItems.cartId, cartItems.productId],
      set: {
        quantity: sql`least(${cartItems.quantity} + ${desired}, ${max})`,
      },
    });

  await db.update(carts).set({ updatedAt: new Date() }).where(eq(carts.id, cartId));
}

export async function setCartQuantity(
  cartId: string,
  productId: number,
  quantity: number,
): Promise<void> {
  if (quantity <= 0) {
    await removeCartItem(cartId, productId);
    return;
  }

  const product = await db
    .select({ stock: products.stock })
    .from(products)
    .where(eq(products.id, productId))
    .limit(1);
  const max = Math.max(product[0]?.stock ?? 1, 1);

  await db
    .update(cartItems)
    .set({ quantity: Math.min(quantity, max) })
    .where(and(eq(cartItems.cartId, cartId), eq(cartItems.productId, productId)));

  await db.update(carts).set({ updatedAt: new Date() }).where(eq(carts.id, cartId));
}

export async function removeCartItem(cartId: string, productId: number): Promise<void> {
  await db
    .delete(cartItems)
    .where(and(eq(cartItems.cartId, cartId), eq(cartItems.productId, productId)));
}

export async function clearCart(cartId: string): Promise<void> {
  await db.delete(cartItems).where(eq(cartItems.cartId, cartId));
}
