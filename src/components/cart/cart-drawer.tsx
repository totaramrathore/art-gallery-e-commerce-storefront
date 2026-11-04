"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { useCart } from "@/components/cart/cart-context";
import { formatPrice, FREE_DOMESTIC_THRESHOLD } from "@/lib/format";

export function CartDrawer() {
  const { cart, isOpen, closeCart, setQuantity, removeItem, busyProductId, notice, hydrated } = useCart();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeCart();
    };
    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, closeCart]);

  if (!isOpen) return null;

  const remaining = Math.max(FREE_DOMESTIC_THRESHOLD - cart.subtotalCents, 0);
  const progress = Math.min((cart.subtotalCents / FREE_DOMESTIC_THRESHOLD) * 100, 100);

  return (
    <div className="fixed inset-0 z-[70]" role="dialog" aria-modal="true" aria-label="Your cart">
      <button
        type="button"
        aria-label="Close cart"
        onClick={closeCart}
        className="fade-in absolute inset-0 h-full w-full cursor-default bg-ink/45 backdrop-blur-[3px]"
      />

      <aside className="drawer-panel absolute inset-y-0 right-0 flex h-full w-full max-w-[28rem] flex-col border-l border-ink/10 bg-bone shadow-[var(--shadow-lift)]">
        <header className="flex items-baseline justify-between border-b border-ink/10 px-6 py-5">
          <div>
            <p className="eyebrow text-ash">Your selection</p>
            <p className="mt-1 font-display text-2xl">
              {cart.itemCount === 0 ? "Cart" : `${cart.itemCount} ${cart.itemCount === 1 ? "work" : "works"}`}
            </p>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={closeCart}
            className="rounded-full border border-ink/20 px-3 py-1 text-xs tracking-[0.16em] uppercase text-ink transition hover:bg-ink hover:text-bone"
          >
            Close
          </button>
        </header>

        {cart.lines.length > 0 && (
          <div className="border-b border-ink/10 bg-bone-2/60 px-6 py-4">
            <div className="flex items-center justify-between text-[11px] tracking-[0.14em] uppercase text-ash">
              <span>{remaining === 0 ? "Complimentary domestic courier unlocked" : `${formatPrice(remaining)} to free courier`}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="mt-2 h-[3px] w-full bg-ink/10">
              <div
                className="h-full bg-ochre transition-[width] duration-700 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {cart.lines.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="grain relative h-28 w-24 overflow-hidden">
                <Image
                  src="/art/clay-vessel.jpg"
                  alt="Ceramic vessel from the gallery"
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              </div>
              <p className="mt-6 font-display text-2xl">Nothing reserved yet</p>
              <p className="mt-2 max-w-xs text-sm leading-relaxed text-ash">
                {hydrated
                  ? "Every work is one of one, or from a small numbered edition. Take your time — we hold nothing back."
                  : "Loading your cart…"}
              </p>
              <Link href="/shop" onClick={closeCart} className="btn-outline mt-7">
                Browse the gallery
              </Link>
            </div>
          ) : (
            <ul className="space-y-6">
              {cart.lines.map((line) => (
                <li key={line.productId} className="flex gap-4">
                  <Link
                    href={`/products/${line.slug}`}
                    onClick={closeCart}
                    className="group relative h-28 w-22 shrink-0 overflow-hidden bg-bone-2"
                    style={{ width: "5.5rem" }}
                  >
                    <Image
                      src={line.image}
                      alt={line.title}
                      fill
                      sizes="88px"
                      className="object-cover transition duration-700 group-hover:scale-105"
                    />
                  </Link>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <Link
                          href={`/products/${line.slug}`}
                          onClick={closeCart}
                          className="block truncate font-display text-lg leading-snug hover:text-ochre"
                        >
                          {line.title}
                        </Link>
                        <p className="mt-0.5 truncate text-xs text-ash">{line.artistName}</p>
                        <p className="mt-0.5 truncate text-[11px] tracking-[0.12em] uppercase text-ash-2">
                          {line.editionLabel}
                        </p>
                      </div>
                      <p className="whitespace-nowrap text-sm tabular-nums">
                        {formatPrice(line.priceCents * line.quantity)}
                      </p>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      {line.stock > 1 ? (
                        <div className="inline-flex items-center border border-ink/15">
                          <button
                            type="button"
                            aria-label={`Decrease quantity of ${line.title}`}
                            onClick={() => setQuantity(line.productId, line.quantity - 1)}
                            disabled={busyProductId === line.productId}
                            className="px-2.5 py-1 text-sm text-ash transition hover:text-ink disabled:opacity-40"
                          >
                            –
                          </button>
                          <span className="min-w-8 text-center text-sm tabular-nums">{line.quantity}</span>
                          <button
                            type="button"
                            aria-label={`Increase quantity of ${line.title}`}
                            onClick={() => setQuantity(line.productId, line.quantity + 1)}
                            disabled={busyProductId === line.productId || line.quantity >= line.stock}
                            className="px-2.5 py-1 text-sm text-ash transition hover:text-ink disabled:opacity-40"
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] tracking-[0.14em] uppercase text-ochre">One only</span>
                      )}

                      <button
                        type="button"
                        onClick={() => removeItem(line.productId)}
                        disabled={busyProductId === line.productId}
                        className="link-underline text-[11px] tracking-[0.14em] uppercase text-ash transition hover:text-ink disabled:opacity-40"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {cart.lines.length > 0 && (
          <footer className="border-t border-ink/10 bg-bone-2/50 px-6 py-5">
            <div className="flex items-baseline justify-between">
              <span className="text-[11px] tracking-[0.18em] uppercase text-ash">Subtotal</span>
              <span className="font-display text-2xl tabular-nums">{formatPrice(cart.subtotalCents)}</span>
            </div>
            <p className="mt-1 text-xs text-ash">
              Freight, duties and framing quoted at checkout. Duties included internationally.
            </p>
            <Link href="/checkout" onClick={closeCart} className="btn-ink mt-4 w-full">
              Proceed to checkout
            </Link>
            <button
              type="button"
              onClick={closeCart}
              className="link-underline mt-4 w-full text-center text-[11px] tracking-[0.16em] uppercase text-ash"
            >
              Keep browsing
            </button>
          </footer>
        )}

        {notice && (
          <div className="fade-in absolute bottom-6 left-6 right-6 border border-ink/15 bg-bone px-4 py-3 text-sm shadow-[var(--shadow-soft)]">
            {notice}
          </div>
        )}
      </aside>
    </div>
  );
}
