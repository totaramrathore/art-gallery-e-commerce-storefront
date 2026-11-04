import {
  addCartItem,
  clearCart,
  ensureCartId,
  loadCart,
  readCartId,
  removeCartItem,
  replaceCartLines,
  setCartQuantity,
  type CartLineInput,
} from "@/lib/cart";

export const dynamic = "force-dynamic";

function badRequest(message: string) {
  return Response.json({ ok: false, error: message }, { status: 400 });
}

export async function GET() {
  try {
    const id = await readCartId();
    const cart = await loadCart(id);
    return Response.json({ ok: true, cart });
  } catch (error) {
    console.error("cart GET failed", error);
    return Response.json({ ok: false, error: "Could not load your cart" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { productId?: number; quantity?: number };
    const productId = Number(body.productId);
    if (!Number.isInteger(productId) || productId <= 0) return badRequest("Missing product");

    const cartId = await ensureCartId();
    try {
      await addCartItem(cartId, productId, Number(body.quantity ?? 1) || 1);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not add to cart";
      return badRequest(message);
    }

    const cart = await loadCart(cartId);
    return Response.json({ ok: true, cart });
  } catch (error) {
    console.error("cart POST failed", error);
    return Response.json({ ok: false, error: "Could not add to cart" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as { productId?: number; quantity?: number };
    const productId = Number(body.productId);
    const quantity = Number(body.quantity);
    if (!Number.isInteger(productId)) return badRequest("Missing product");
    if (!Number.isFinite(quantity)) return badRequest("Missing quantity");

    const cartId = await readCartId();
    if (!cartId) return Response.json({ ok: true, cart: { id: null, lines: [], itemCount: 0, subtotalCents: 0 } });

    await setCartQuantity(cartId, productId, Math.floor(quantity));
    const cart = await loadCart(cartId);
    return Response.json({ ok: true, cart });
  } catch (error) {
    console.error("cart PATCH failed", error);
    return Response.json({ ok: false, error: "Could not update your cart" }, { status: 500 });
  }
}

/**
 * Full replace — used by the client to push its own (source-of-truth) basket back
 * to the server. Prices, stock and titles are re-read from the database, so a
 * lost or blocked cookie can never silently empty someone's cart.
 */
export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as { lines?: CartLineInput[] };
    const lines = Array.isArray(body.lines) ? body.lines : [];

    if (lines.length > 50) return badRequest("That cart looks too large");

    const cartId = await ensureCartId();
    const cart = await replaceCartLines(cartId, lines);
    return Response.json({ ok: true, cart });
  } catch (error) {
    console.error("cart PUT failed", error);
    return Response.json({ ok: false, error: "Could not save your cart" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      productId?: number;
      clear?: boolean;
    };
    const cartId = await readCartId();
    if (!cartId) return Response.json({ ok: true, cart: { id: null, lines: [], itemCount: 0, subtotalCents: 0 } });

    if (body.clear) {
      await clearCart(cartId);
    } else if (Number.isInteger(Number(body.productId))) {
      await removeCartItem(cartId, Number(body.productId));
    } else {
      return badRequest("Missing product");
    }

    const cart = await loadCart(cartId);
    return Response.json({ ok: true, cart });
  } catch (error) {
    console.error("cart DELETE failed", error);
    return Response.json({ ok: false, error: "Could not remove the item" }, { status: 500 });
  }
}
