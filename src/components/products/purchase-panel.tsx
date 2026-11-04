"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCart } from "@/components/cart/cart-context";
import { formatPrice } from "@/lib/format";

export type PurchaseProduct = {
  id: number;
  slug: string;
  title: string;
  priceCents: number;
  stock: number;
  image: string;
  artistName: string;
  artistSlug: string;
  medium: string;
  dimensions: string;
  editionLabel: string;
};

export function PurchasePanel({ product }: { product: PurchaseProduct }) {
  const { addItem } = useCart();
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [busy, setBusy] = useState<"add" | "buy" | null>(null);
  const sold = product.stock <= 0;

  const payload = {
    productId: product.id,
    slug: product.slug,
    title: product.title,
    artistName: product.artistName,
    artistSlug: product.artistSlug,
    image: product.image,
    priceCents: product.priceCents,
    stock: product.stock,
    medium: product.medium,
    dimensions: product.dimensions,
    editionLabel: product.editionLabel,
  };

  const handleAdd = async () => {
    setBusy("add");
    await addItem({ ...payload, quantity });
    setBusy(null);
  };

  const handleBuyNow = async () => {
    setBusy("buy");
    const ok = await addItem({ ...payload, quantity }, { openDrawer: false });
    setBusy(null);
    if (ok) router.push("/checkout");
  };

  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <p className="font-display text-3xl tabular-nums">{formatPrice(product.priceCents)}</p>
        <p
          className={`text-[11px] tracking-[0.16em] uppercase ${
            sold ? "text-ash-2" : "text-ochre"
          }`}
        >
          {sold ? "Sold" : product.stock === 1 ? "One only" : `${product.stock} available`}
        </p>
      </div>

      <div className="mt-7 flex flex-col gap-3">
        {!sold && (
          <div className="flex gap-3">
            {product.stock > 1 && (
              <div className="inline-flex shrink-0 items-center border border-ink/15">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                  className="px-4 py-3 text-ash transition hover:text-ink"
                >
                  –
                </button>
                <span className="min-w-8 text-center text-sm tabular-nums">{quantity}</span>
                <button
                  type="button"
                  aria-label="Increase quantity"
                  onClick={() => setQuantity((value) => Math.min(product.stock, value + 1))}
                  className="px-4 py-3 text-ash transition hover:text-ink"
                >
                  +
                </button>
              </div>
            )}
            <button type="button" onClick={handleAdd} disabled={busy !== null} className="btn-ink flex-1">
              {busy === "add" ? "Adding…" : "Add to cart"}
            </button>
          </div>
        )}

        {!sold ? (
          <button type="button" onClick={handleBuyNow} disabled={busy !== null} className="btn-outline">
            {busy === "buy" ? "Preparing…" : "Buy now — express checkout"}
          </button>
        ) : (
          <a href="mailto:hello@ochreandash.gallery" className="btn-outline">
            Join the waiting list
          </a>
        )}
      </div>

      <ul className="mt-7 space-y-2 border-t border-ink/10 pt-6 text-xs leading-relaxed text-ash">
        <li>· Ships insured from Cape Town, crated where needed.</li>
        <li>· Signed certificate of authenticity with provenance notes.</li>
        <li>· Seven-day live-with-it viewing period on every work.</li>
      </ul>

      <div className="mt-7 space-y-3">
        <Accordion title="Freight & delivery">
          Collection from 23 Bree Street is free and usually ready within 24 hours. Domestic courier is $35
          (complimentary above $2,500) and arrives in 2–4 working days. International orders ship crated and
          fully insured with duties included — allow 5–10 working days.
        </Accordion>
        <Accordion title="Returns & viewing">
          If the work is wrong for the room, tell us within seven days of delivery and we will arrange the
          return and refund in full. You are also welcome to reserve a work and view it in the gallery before
          paying — WhatsApp us on +27 82 551 0042.
        </Accordion>
        <Accordion title="Care">
          Keep out of direct, prolonged sunlight and away from damp. Never use household cleaners on raw
          pigment, limewash or unglazed clay — a soft, dry brush is all any of these works will ever need.
        </Accordion>
      </div>
    </div>
  );
}

function Accordion({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <details className="group border-b border-ink/10 pb-3">
      <summary className="flex cursor-pointer items-center justify-between gap-4 text-[11px] tracking-[0.18em] uppercase text-ink-2 marker:content-['']">
        {title}
        <span className="text-ash transition-transform duration-300 group-open:rotate-45">+</span>
      </summary>
      <div className="mt-3 text-sm leading-relaxed text-ash">{children}</div>
    </details>
  );
}
