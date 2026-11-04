import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { orderItems, orders } from "@/db/schema";
import { Reveal } from "@/components/ui/reveal";
import { formatDate, formatPrice, shippingOption } from "@/lib/format";
import { SITE } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Order confirmed",
  robots: { index: false },
};

type Params = Promise<{ orderNumber: string }>;

export default async function OrderPage({ params }: { params: Params }) {
  const { orderNumber } = await params;

  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.orderNumber, decodeURIComponent(orderNumber)))
    .limit(1);

  if (!order) notFound();

  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
  const shipping = shippingOption(order.shippingMethod);
  const collecting = order.shippingMethod === "pickup";

  return (
    <div className="container-x pb-24 pt-14 md:pt-20">
      <Reveal>
        <div className="max-w-3xl">
          <p className="eyebrow text-ochre">Order {order.orderNumber}</p>
          <h1 className="mt-4 font-display text-[clamp(2.25rem,5.5vw,4rem)] leading-[1.0]">
            {collecting ? "Reserved — come and see it" : "Reserved and being crated"}
          </h1>
          <p className="mt-6 text-base leading-relaxed text-ash">
            Thank you, {order.fullName.split(" ")[0]}. A confirmation and your certificate of authenticity are
            on their way to <span className="text-ink-2">{order.email}</span>. Placed{" "}
            {formatDate(order.createdAt)}.
          </p>
        </div>
      </Reveal>

      <div className="mt-14 grid gap-12 lg:grid-cols-[1.3fr_1fr] lg:gap-16">
        <div>
          <div className="border-t border-ink/12 pt-8">
            <p className="eyebrow text-ash">What happens next</p>
            <ol className="mt-6 space-y-6">
              {(collecting
                ? [
                    "We take the work off the wall and label it with your name.",
                    "You collect it from the gallery — usually ready within 24 hours.",
                    "Live with it for seven days. If it is wrong for the room, we refund in full.",
                  ]
                : [
                    "Your work is condition-checked, wrapped and crated by hand.",
                    "You receive insured, tracked freight details by email.",
                    "Live with it for seven days. If it is wrong for the room, we arrange the return and refund in full.",
                  ]
              ).map((line, index) => (
                <li key={line} className="flex gap-5">
                  <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-ink/20 text-[11px] tabular-nums text-ash">
                    {index + 1}
                  </span>
                  <p className="text-sm leading-relaxed text-ink-2">{line}</p>
                </li>
              ))}
            </ol>
          </div>

          <div className="mt-12 border-t border-ink/12 pt-8">
            <p className="eyebrow text-ash">Your works</p>
            <ul className="mt-6 divide-y divide-ink/10">
              {items.map((item) => (
                <li key={item.id} className="flex gap-5 py-6 first:pt-0">
                  <Link
                    href={`/products/${item.slug}`}
                    className="relative h-24 shrink-0 overflow-hidden bg-bone-2"
                    style={{ width: "5rem" }}
                  >
                    <Image
                      src={item.imageUrl}
                      alt={item.title}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </Link>
                  <div className="flex flex-1 items-start justify-between gap-4">
                    <div>
                      <Link href={`/products/${item.slug}`} className="font-display text-lg hover:text-ochre">
                        {item.title}
                      </Link>
                      <p className="mt-1 text-xs text-ash">{item.artistName}</p>
                      <p className="mt-1 text-[11px] tracking-[0.14em] uppercase text-ash-2">
                        Qty {item.quantity}
                      </p>
                    </div>
                    <p className="text-sm tabular-nums">
                      {formatPrice(item.unitPriceCents * item.quantity)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="border border-ink/12 bg-bone-2/45 p-6">
            <p className="eyebrow text-ash">Summary</p>
            <dl className="mt-6 space-y-2.5 text-sm">
              <div className="flex justify-between text-ash">
                <dt>Subtotal</dt>
                <dd className="tabular-nums text-ink-2">{formatPrice(order.subtotalCents)}</dd>
              </div>
              <div className="flex justify-between text-ash">
                <dt>{shipping.label}</dt>
                <dd className="tabular-nums text-ink-2">
                  {order.shippingCents === 0 ? "Complimentary" : formatPrice(order.shippingCents)}
                </dd>
              </div>
              <div className="mt-3 flex items-baseline justify-between border-t border-ink/10 pt-4">
                <dt className="text-[11px] tracking-[0.16em] uppercase text-ash">Total paid</dt>
                <dd className="font-display text-3xl tabular-nums">{formatPrice(order.totalCents)}</dd>
              </div>
            </dl>

            <div className="mt-7 space-y-1.5 border-t border-ink/10 pt-5 text-xs leading-relaxed text-ash">
              <p className="text-[11px] tracking-[0.16em] uppercase text-ash-2">
                {collecting ? "Collection" : "Delivery"}
              </p>
              {collecting ? (
                <>
                  <p>{SITE.address}</p>
                  <p>{SITE.city}</p>
                  <p>{SITE.hours}</p>
                </>
              ) : (
                <>
                  <p>{order.fullName}</p>
                  <p>{order.address1}</p>
                  {order.address2 && <p>{order.address2}</p>}
                  <p>
                    {order.city}
                    {order.region ? `, ${order.region}` : ""} {order.postalCode}
                  </p>
                  <p>{order.country}</p>
                </>
              )}
              <p className="pt-2">{shipping.eta}</p>
            </div>

            {order.notes && (
              <div className="mt-6 border-t border-ink/10 pt-5 text-xs leading-relaxed text-ash">
                <p className="text-[11px] tracking-[0.16em] uppercase text-ash-2">Your note</p>
                <p className="mt-2">{order.notes}</p>
              </div>
            )}
          </div>

          <div className="mt-6 flex flex-col gap-3">
            <Link href="/shop" className="btn-ink">
              Keep browsing
            </Link>
            <a href={`mailto:${SITE.email}?subject=Order%20${order.orderNumber}`} className="btn-outline">
              Ask us about this order
            </a>
          </div>
        </aside>
      </div>
    </div>
  );
}
