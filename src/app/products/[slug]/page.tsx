import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ProductCard } from "@/components/products/product-card";
import { ProductGallery } from "@/components/products/product-gallery";
import { PurchasePanel } from "@/components/products/purchase-panel";
import { ReviewsSection } from "@/components/products/reviews";
import { Reveal } from "@/components/ui/reveal";
import { Stars } from "@/components/ui/stars";
import { formatPrice } from "@/lib/format";
import { getArtistBySlug, getProductBySlug, getRelatedProducts } from "@/lib/queries";

export const dynamic = "force-dynamic";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const detail = await getProductBySlug(slug);
  if (!detail) return { title: "Work not found" };
  return {
    title: `${detail.product.title} — ${detail.product.artistName}`,
    description: detail.product.description,
    openGraph: {
      title: `${detail.product.title} · Ochre & Ash Gallery`,
      description: detail.product.description,
      images: [{ url: detail.product.image }],
    },
  };
}

export default async function ProductPage({ params }: { params: Params }) {
  const { slug } = await params;
  const detail = await getProductBySlug(slug);

  if (!detail) notFound();

  const { product, images, reviews, ratingBreakdown } = detail;
  const [related, artist] = await Promise.all([
    getRelatedProducts(product, 4),
    getArtistBySlug(product.artistSlug),
  ]);

  const specs = [
    { label: "Medium", value: product.medium },
    { label: "Materials", value: product.materials },
    { label: "Year", value: String(product.year) },
    { label: "Dimensions", value: product.dimensions },
    { label: "Edition", value: product.editionLabel },
    { label: "Reference", value: product.slug.toUpperCase().slice(0, 12) },
  ];

  return (
    <article className="pb-24">
      <div className="container-x pt-8">
        <nav className="flex flex-wrap items-center gap-2 text-[11px] tracking-[0.14em] uppercase text-ash-2">
          <Link href="/" className="hover:text-ochre">
            Gallery
          </Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-ochre">
            Works
          </Link>
          <span>/</span>
          <Link href={`/collections/${product.collectionSlug}`} className="hover:text-ochre">
            {product.collectionName}
          </Link>
        </nav>
      </div>

      <div className="container-x mt-8 grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <ProductGallery images={images} title={product.title} />
        </div>

        <div>
          <Reveal>
            <Link
              href={`/collections/${product.collectionSlug}`}
              className="eyebrow text-ochre hover:text-ink"
            >
              {product.collectionName}
            </Link>
            <h1 className="mt-4 font-display text-[clamp(2.25rem,4.5vw,3.75rem)] leading-[1.02]">
              {product.title}
            </h1>

            <p className="mt-4 text-sm text-ash">
              <Link href={`/shop?artist=${product.artistSlug}`} className="link-underline text-ink-2">
                {product.artistName}
              </Link>
              <span className="text-ash-2"> · {product.artistLocation}</span>
            </p>

            {product.reviewCount > 0 && (
              <a href="#reviews" className="mt-4 inline-flex items-center gap-2 text-xs text-ash">
                <Stars rating={product.ratingTenths / 10} />
                <span className="tabular-nums">{(product.ratingTenths / 10).toFixed(1)}</span>
                <span className="link-underline">{product.reviewCount} collector notes</span>
              </a>
            )}

            <p className="mt-6 max-w-lg text-base leading-relaxed text-ink-2">{product.description}</p>
          </Reveal>

          <div className="mt-10">
            <PurchasePanel
              product={{
                id: product.id,
                slug: product.slug,
                title: product.title,
                priceCents: product.priceCents,
                stock: product.stock,
                image: product.image,
                artistName: product.artistName,
                artistSlug: product.artistSlug,
                medium: product.medium,
                dimensions: product.dimensions,
                editionLabel: product.editionLabel,
              }}
            />
          </div>

          <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-ink/10 pt-8">
            {specs.map((spec) => (
              <div key={spec.label}>
                <dt className="text-[10px] tracking-[0.18em] uppercase text-ash-2">{spec.label}</dt>
                <dd className="mt-1.5 text-sm text-ink-2">{spec.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* story */}
      <section className="container-x mt-24 grid gap-12 border-t border-ink/10 pt-14 lg:grid-cols-[1fr_1.15fr]">
        <Reveal>
          <div>
            <p className="eyebrow text-ash">About this work</p>
            <h2 className="mt-3 font-display text-3xl">Notes from the stockroom</h2>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-ash">{product.collectionDescription}</p>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <p className="font-display text-[clamp(1.25rem,2.4vw,1.75rem)] leading-[1.5] text-ink-2 first-letter:float-left first-letter:mr-3 first-letter:font-display first-letter:text-6xl first-letter:leading-[0.8] first-letter:text-ochre">
            {product.story}
          </p>
        </Reveal>
      </section>

      {/* artist */}
      {artist && (
        <section className="container-x mt-20 border-t border-ink/10 pt-14">
          <div className="grid gap-10 lg:grid-cols-[18rem_1fr] lg:items-center">
            <Reveal>
              <div className="zoom-frame relative aspect-[4/5] w-full max-w-xs">
                <Image
                  src={artist.image}
                  alt={artist.name}
                  fill
                  sizes="(min-width: 1024px) 18rem, 80vw"
                  className="object-cover"
                />
              </div>
            </Reveal>
            <Reveal delay={120}>
              <p className="eyebrow text-ash">The artist</p>
              <h2 className="mt-3 font-display text-3xl">{artist.name}</h2>
              <p className="mt-1 text-sm text-ash">{artist.location}</p>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-ink-2">{artist.bio}</p>
              <Link href={`/shop?artist=${artist.slug}`} className="btn-outline mt-8">
                All work by {artist.name.split(" ")[0]}
              </Link>
            </Reveal>
          </div>
        </section>
      )}

      {/* reviews */}
      <div className="container-x mt-20">
        <ReviewsSection
          slug={product.slug}
          ratingTenths={product.ratingTenths}
          reviewCount={product.reviewCount}
          breakdown={ratingBreakdown}
          reviews={reviews.map((review) => ({
            id: review.id,
            authorName: review.authorName,
            authorLocation: review.authorLocation,
            rating: review.rating,
            title: review.title,
            body: review.body,
            verifiedPurchase: review.verifiedPurchase,
            createdAt: review.createdAt.toISOString(),
          }))}
        />
      </div>

      {/* related */}
      {related.length > 0 && (
        <section className="container-x mt-24">
          <div className="flex flex-wrap items-end justify-between gap-4 border-t border-ink/10 pt-14">
            <h2 className="font-display text-3xl">You might also live with</h2>
            <p className="text-sm text-ash">
              From {formatPrice(Math.min(...related.map((item) => item.priceCents)))} to{" "}
              {formatPrice(Math.max(...related.map((item) => item.priceCents)))}
            </p>
          </div>

          <div className="mt-10 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((item, index) => (
              <Reveal key={item.id} delay={index * 100}>
                <ProductCard product={item} sizes="(min-width: 1024px) 22vw, 45vw" />
              </Reveal>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
