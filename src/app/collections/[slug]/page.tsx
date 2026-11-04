import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ProductCard } from "@/components/products/product-card";
import { SortSelect } from "@/components/products/shop-controls";
import { Reveal } from "@/components/ui/reveal";
import { formatPrice } from "@/lib/format";
import { getCollectionBySlug, listProducts } from "@/lib/queries";

export const dynamic = "force-dynamic";

type Params = Promise<{ slug: string }>;
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug);
  if (!collection) return { title: "Collection not found" };
  return { title: collection.name, description: collection.tagline };
}

export default async function CollectionPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const collection = await getCollectionBySlug(slug);

  if (!collection) notFound();

  const sortParam = Array.isArray(query.sort) ? query.sort[0] : query.sort;
  const items = await listProducts({ collection: slug, sort: sortParam });

  const prices = items.map((item) => item.priceCents);

  return (
    <div>
      <header className="relative isolate overflow-hidden bg-ink text-bone">
        <Image
          src={collection.image}
          alt={collection.name}
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/50 to-ink/20" />
        <div className="grain absolute inset-0" />
        <div className="container-x relative py-24 md:py-32">
          <Reveal>
            <p className="eyebrow text-ochre-2">A room of the gallery</p>
            <h1 className="mt-5 max-w-3xl font-display text-[clamp(2.5rem,6vw,4.75rem)] leading-[0.98]">
              {collection.name}
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-bone/75">{collection.description}</p>
            <p className="mt-8 text-[11px] tracking-[0.2em] uppercase text-bone/55">
              {collection.count} works · {prices.length
                ? `${formatPrice(Math.min(...prices))} – ${formatPrice(Math.max(...prices))}`
                : "Enquire"}
            </p>
          </Reveal>
        </div>
      </header>

      <div className="container-x pb-24 pt-10">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ink/10 pb-4">
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/collections" className="eyebrow text-ash hover:text-ochre">
              ← All collections
            </Link>
            <span className="text-ash-2">/</span>
            <Link href={`/shop?collection=${collection.slug}`} className="eyebrow text-ochre hover:text-ink">
              Filter this room →
            </Link>
          </div>
          <div className="flex items-center gap-5">
            <p className="text-sm text-ash">{items.length} works</p>
            <SortSelect />
          </div>
        </div>

        {items.length === 0 ? (
          <p className="mt-16 border border-dashed border-ink/20 px-6 py-20 text-center font-display text-2xl">
            This room is being re-hung. Check back on Friday.
          </p>
        ) : (
          <div className="mt-10 grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((product, index) => (
              <Reveal key={product.id} delay={(index % 3) * 90}>
                <ProductCard product={product} priority={index < 3} />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
