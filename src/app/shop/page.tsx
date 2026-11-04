import Link from "next/link";
import type { Metadata } from "next";
import { ProductCard } from "@/components/products/product-card";
import { ShopControls, SortSelect } from "@/components/products/shop-controls";
import { Reveal } from "@/components/ui/reveal";
import { getShopFacets, listProducts } from "@/lib/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "All works",
  description:
    "Browse every available painting, work on paper, ceramic vessel, woven hanging and studio edition at Ochre & Ash Gallery.",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function single(params: Record<string, string | string[] | undefined>, key: string): string | undefined {
  const value = params[key];
  if (Array.isArray(value)) return value[0];
  return value ?? undefined;
}

export default async function ShopPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;

  const collection = single(params, "collection");
  const artist = single(params, "artist");
  const medium = single(params, "medium");
  const price = single(params, "price");
  const sort = single(params, "sort") ?? "featured";
  const q = single(params, "q");
  const inStock = single(params, "inStock") === "1";

  const [items, facets] = await Promise.all([
    listProducts({ collection, artist, medium, price, sort, q, inStockOnly: inStock }),
    getShopFacets(),
  ]);

  const activeCollection = facets.collections.find((entry) => entry.slug === collection);
  const activeArtist = facets.artists.find((entry) => entry.slug === artist);

  const heading = activeCollection?.name ?? activeArtist?.name ?? (medium ? medium : "All works");
  const subheading = activeCollection
    ? "A whole room of the gallery, in one place."
    : activeArtist
      ? `Works in the gallery by ${activeArtist.name}.`
      : "Every available work, straight off the wall at 23 Bree Street.";

  const chips: { label: string; href: string }[] = [];
  const buildHref = (drop?: string) => {
    const next = new URLSearchParams();
    const entries: [string, string | undefined][] = [
      ["collection", collection],
      ["artist", artist],
      ["medium", medium],
      ["price", price],
      ["q", q],
      ["sort", sort !== "featured" ? sort : undefined],
      ["inStock", inStock ? "1" : undefined],
    ];
    for (const [key, value] of entries) {
      if (value && key !== drop) next.set(key, value);
    }
    const query = next.toString();
    return query ? `/shop?${query}` : "/shop";
  };

  if (collection) chips.push({ label: activeCollection?.name ?? collection, href: buildHref("collection") });
  if (artist) chips.push({ label: activeArtist?.name ?? artist, href: buildHref("artist") });
  if (medium) chips.push({ label: medium, href: buildHref("medium") });
  if (price) chips.push({ label: `Price: ${price.replace("-", " – ").replace("plus", "+")}`, href: buildHref("price") });
  if (q) chips.push({ label: `“${q}”`, href: buildHref("q") });
  if (inStock) chips.push({ label: "Available now", href: buildHref("inStock") });

  return (
    <div className="container-x pb-24 pt-14 md:pt-20">
      <header className="border-b border-ink/10 pb-10">
        <Reveal>
          <p className="eyebrow text-ash">The collection</p>
          <h1 className="mt-4 font-display text-[clamp(2.5rem,6vw,4.5rem)] leading-[0.98]">{heading}</h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-ash">{subheading}</p>
        </Reveal>

        <Reveal delay={120}>
          <form action="/shop" method="get" className="mt-8 flex max-w-md items-center gap-3 border-b border-ink/20 focus-within:border-ochre">
            {collection && <input type="hidden" name="collection" value={collection} />}
            <input
              type="search"
              name="q"
              defaultValue={q ?? ""}
              placeholder="Search titles, materials, artists…"
              aria-label="Search works"
              className="w-full bg-transparent py-2 text-sm placeholder:text-ash-2/70 focus:outline-none"
            />
            <button type="submit" className="pb-1 text-[11px] tracking-[0.18em] uppercase text-ochre">
              Search
            </button>
          </form>
        </Reveal>
      </header>

      <div className="mt-10 grid gap-12 lg:grid-cols-[15rem_1fr] lg:gap-14">
        <ShopControls facets={facets} total={facets.price.total} />

        <div>
          <div className="hidden items-center justify-between gap-6 border-b border-ink/10 pb-4 lg:flex">
            <p className="text-sm text-ash">
              <span className="tabular-nums text-ink">{items.length}</span>{" "}
              {items.length === 1 ? "work" : "works"}
              {chips.length > 0 && " · filtered"}
            </p>
            <SortSelect sort={sort} />
          </div>

          <div className="mt-4 hidden flex-wrap gap-2 lg:flex">
            {chips.map((chip) => (
              <Link
                key={chip.href + chip.label}
                href={chip.href}
                className="group inline-flex items-center gap-2 border border-ink/15 px-3 py-1.5 text-[11px] tracking-[0.14em] uppercase text-ink-2 transition hover:border-ink/40"
              >
                {chip.label}
                <span className="text-ash-2 transition group-hover:text-ochre">×</span>
              </Link>
            ))}
          </div>

          {items.length === 0 ? (
            <div className="mt-16 border border-dashed border-ink/20 px-6 py-20 text-center">
              <p className="font-display text-2xl">Nothing matches that yet</p>
              <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-ash">
                Try widening the price band or clearing a filter — or tell us what you are hunting for and we
                will look in the stockroom.
              </p>
              <Link href="/shop" className="btn-outline mt-8">
                Clear everything
              </Link>
            </div>
          ) : (
            <div className="mt-8 grid gap-x-6 gap-y-12 sm:grid-cols-2 xl:grid-cols-3">
              {items.map((product, index) => (
                <Reveal key={product.id} delay={(index % 3) * 90}>
                  <ProductCard product={product} priority={index < 3} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
