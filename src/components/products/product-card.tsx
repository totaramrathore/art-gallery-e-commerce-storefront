"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/components/cart/cart-context";
import { Stars } from "@/components/ui/stars";
import { formatPrice } from "@/lib/format";
import type { ProductCard as CardProduct } from "@/lib/queries";

export function ProductCard({
  product,
  priority = false,
  sizes = "(min-width: 1280px) 24vw, (min-width: 900px) 32vw, 88vw",
}: {
  product: CardProduct;
  priority?: boolean;
  sizes?: string;
}) {
  const { addItem } = useCart();
  const [adding, setAdding] = useState(false);
  const sold = product.stock <= 0;

  const handleAdd = async () => {
    if (sold) return;
    setAdding(true);
    await addItem({
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
    });
    setAdding(false);
  };

  return (
    <article className="group flex flex-col">
      <div className="relative">
        <Link
          href={`/products/${product.slug}`}
          className="zoom-frame relative block aspect-[4/5] w-full"
          aria-label={`${product.title} by ${product.artistName}`}
        >
          <Image
            src={product.image}
            alt={`${product.title} — ${product.materials}`}
            fill
            sizes={sizes}
            priority={priority}
            className="object-cover"
          />
        </Link>

        <span className="pointer-events-none absolute left-3 top-3 bg-bone/90 px-2.5 py-1 text-[10px] tracking-[0.18em] uppercase text-ink-2 backdrop-blur-sm">
          {product.medium}
        </span>

        {sold && (
          <span className="pointer-events-none absolute right-3 top-3 bg-ink/85 px-2.5 py-1 text-[10px] tracking-[0.18em] uppercase text-bone">
            Sold
          </span>
        )}

        {!sold && (
          <div className="absolute inset-x-3 bottom-3 translate-y-0 opacity-100 transition-all duration-500 focus-within:translate-y-0 focus-within:opacity-100 lg:translate-y-3 lg:opacity-0 lg:group-hover:translate-y-0 lg:group-hover:opacity-100">
            <button
              type="button"
              onClick={handleAdd}
              disabled={adding}
              className="w-full bg-ink/92 py-3 text-[11px] tracking-[0.2em] uppercase text-bone backdrop-blur-sm transition hover:bg-ochre-deep disabled:opacity-60"
            >
              {adding ? "Adding…" : product.stock === 1 ? "Reserve — one only" : "Add to cart"}
            </button>
          </div>
        )}
      </div>

      <div className="mt-4 flex items-start justify-between gap-5">
        <div className="min-w-0">
          <Link href={`/products/${product.slug}`} className="block">
            <h3 className="font-display text-xl leading-snug transition-colors group-hover:text-ochre">
              {product.title}
            </h3>
          </Link>
          <p className="mt-1 text-xs text-ash">
            <Link href={`/shop?artist=${product.artistSlug}`} className="link-underline hover:text-ink">
              {product.artistName}
            </Link>
            <span className="text-ash-2"> · {product.artistLocation.split(",")[0]}</span>
          </p>
          {product.reviewCount > 0 && (
            <p className="mt-2 flex items-center gap-1.5 text-[11px] text-ash">
              <Stars rating={product.ratingTenths / 10} />
              <span className="tabular-nums">{(product.ratingTenths / 10).toFixed(1)}</span>
              <span className="text-ash-2">({product.reviewCount})</span>
            </p>
          )}
        </div>
        <div className="shrink-0 text-right">
          <p className="text-sm tabular-nums">{formatPrice(product.priceCents)}</p>
          <p className="mt-1 text-[10px] tracking-[0.14em] uppercase text-ash-2">
            {product.dimensions.split(" ")[0]}
          </p>
        </div>
      </div>
    </article>
  );
}
