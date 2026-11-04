import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { cartItems, orderItems, orders, products } from "@/db/schema";
import { loadCart, readCartId, resolveLines, type CartLineInput } from "@/lib/cart";
import { orderNumber, shippingCostCents } from "@/lib/format";

export const dynamic = "force-dynamic";

type CheckoutBody = {
  fullName?: string;
  email?: string;
  phone?: string;
  address1?: string;
  address2?: string;
  city?: string;
  region?: string;
  postalCode?: string;
  country?: string;
  shippingMethod?: string;
  notes?: string;
  items?: CartLineInput[];
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CheckoutBody;

    const fullName = (body.fullName ?? "").trim();
    const email = (body.email ?? "").trim();
    const shippingMethod = (body.shippingMethod ?? "pickup").trim();

    if (fullName.length < 2) {
      return Response.json({ ok: false, error: "Please tell us your name." }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json({ ok: false, error: "Please enter a valid email address." }, { status: 400 });
    }

    // The server cart is authoritative, but if the cookie was blocked or lost we
    // fall back to the lines the client sent — always re-priced from the database.
    const cartId = await readCartId();
    const cart = await loadCart(cartId);
    const clientItems = Array.isArray(body.items) ? body.items : [];

    let lines = cart.lines;
    if (!lines.length && clientItems.length) {
      lines = await resolveLines(clientItems);
    }

    if (!lines.length) {
      return Response.json({ ok: false, error: "Your cart is empty." }, { status: 400 });
    }

    const needsAddress = shippingMethod !== "pickup";
    if (needsAddress) {
      const required = [body.address1, body.city, body.postalCode, body.country];
      if (required.some((field) => !field || !field.trim())) {
        return Response.json(
          { ok: false, error: "A full shipping address is required for delivery." },
          { status: 400 },
        );
      }
    }

    const subtotalCents = lines.reduce((sum, line) => sum + line.priceCents * line.quantity, 0);
    const shippingCents = shippingCostCents(shippingMethod, subtotalCents);
    const totalCents = subtotalCents + shippingCents;
    const number = orderNumber();

    await db.transaction(async (tx) => {
      const [order] = await tx
        .insert(orders)
        .values({
          orderNumber: number,
          cartId: cartId,
          fullName,
          email,
          phone: (body.phone ?? "").trim(),
          address1: (body.address1 ?? "").trim(),
          address2: (body.address2 ?? "").trim(),
          city: (body.city ?? "").trim(),
          region: (body.region ?? "").trim(),
          postalCode: (body.postalCode ?? "").trim(),
          country: (body.country ?? "").trim(),
          shippingMethod,
          subtotalCents,
          shippingCents,
          totalCents,
          notes: (body.notes ?? "").trim(),
        })
        .returning();

      await tx.insert(orderItems).values(
        lines.map((line) => ({
          orderId: order.id,
          productId: line.productId,
          slug: line.slug,
          title: line.title,
          artistName: line.artistName,
          imageUrl: line.image,
          unitPriceCents: line.priceCents,
          quantity: line.quantity,
        })),
      );

      for (const line of lines) {
        await tx
          .update(products)
          .set({ stock: sql`greatest(${products.stock} - ${line.quantity}, 0)` })
          .where(eq(products.id, line.productId));
      }

      // Only clear the persisted cart when one actually exists for this browser.
      if (cartId) {
        await tx.delete(cartItems).where(eq(cartItems.cartId, cartId));
      }
    });

    return Response.json({ ok: true, orderNumber: number, totalCents });
  } catch (error) {
    console.error("checkout failed", error);
    return Response.json(
      { ok: false, error: "We could not place your order. Please try again." },
      { status: 500 },
    );
  }
}

