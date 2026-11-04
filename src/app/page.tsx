import Image from "next/image";
import Link from "next/link";
import { ProductCard } from "@/components/products/product-card";
import { Reveal } from "@/components/ui/reveal";
import { formatPrice } from "@/lib/format";
import {
  getArtists,
  getCollections,
  getFeaturedProducts,
  getGalleryStats,
  getNewArrivals,
} from "@/lib/queries";
import { GUARANTEES, SITE, TICKER } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [collections, featured, arrivals, artists, stats] = await Promise.all([
    getCollections(),
    getFeaturedProducts(6),
    getNewArrivals(4),
    getArtists(),
    getGalleryStats(),
  ]);

  const heroCollection = collections[0];
  const spotlight = artists.slice(0, 3);

  return (
    <>
      {/* ---------------- hero ---------------- */}
      <section className="relative isolate min-h-[88vh] overflow-hidden bg-ink">
        <Image
          src="/art/hero-gallery.jpg"
          alt="The Ochre & Ash gallery room on Bree Street, Cape Town"
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-95"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/45 to-ink/25" />
        <div className="grain absolute inset-0" />

        <div className="container-x relative flex min-h-[88vh] flex-col justify-end pb-14 pt-28 text-bone">
          <Reveal>
            <p className="eyebrow text-ochre-2">Cape Town · Est. {SITE.since} · Worldwide freight</p>
          </Reveal>

          <Reveal delay={120}>
            <h1 className="mt-6 max-w-4xl font-display text-[clamp(2.75rem,7vw,5.75rem)] leading-[0.98] font-light tracking-[-0.02em]">
              Paint made from the ground we stand on.
            </h1>
          </Reveal>

          <Reveal delay={240}>
            <p className="mt-7 max-w-xl text-base leading-relaxed text-bone/75 md:text-lg">
              Ochre &amp; Ash is a small gallery on Bree Street for original paintings, works on paper,
              stoneware and woven textiles — hand-ground pigment from the Karoo, sifted ash from Cairo, clay
              from Valencia. Every work is one of one, or from a small numbered edition.
            </p>
          </Reveal>

          <Reveal delay={340}>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link href="/shop" className="btn-ink bg-bone text-ink hover:bg-ochre-2">
                Browse the collection
              </Link>
              <Link
                href="/collections"
                className="btn-outline border-bone/40 text-bone hover:border-bone hover:bg-bone hover:text-ink"
              >
                Five rooms to explore
              </Link>
            </div>
          </Reveal>

          <Reveal delay={440}>
            <dl className="mt-14 grid max-w-2xl grid-cols-3 gap-6 border-t border-bone/20 pt-8">
              {[
                { value: `${stats.works}`, label: "Works available" },
                { value: `${stats.artists}`, label: "Artists represented" },
                { value: `${stats.countries}`, label: "Cities of origin" },
              ].map((item) => (
                <div key={item.label}>
                  <dt className="font-display text-3xl md:text-4xl">{item.value}</dt>
                  <dd className="mt-1 text-[11px] tracking-[0.16em] uppercase text-bone/55">{item.label}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </section>

      {/* ---------------- ticker ---------------- */}
      <section className="border-b border-ink/10 bg-bone-2/60 py-4" aria-hidden>
        <div className="marquee">
          <div className="marquee-track items-center gap-10 pr-10">
            {[...TICKER, ...TICKER].map((city, index) => (
              <span
                key={`${city}-${index}`}
                className="flex items-center gap-10 text-[11px] tracking-[0.28em] uppercase text-ash"
              >
                {city}
                <span className="text-ochre">✦</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- featured collections ---------------- */}
      <section className="container-x py-20 md:py-28">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <Reveal>
            <p className="eyebrow text-ash">The rooms</p>
            <h2 className="mt-3 max-w-2xl font-display text-[clamp(2rem,4vw,3.25rem)] leading-[1.05]">
              Five collections, one obsession with material
            </h2>
          </Reveal>
          <Reveal delay={120}>
            <Link href="/collections" className="link-underline eyebrow text-ochre">
              All collections →
            </Link>
          </Reveal>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {collections.slice(0, 4).map((collection, index) => (
            <Reveal key={collection.slug} delay={index * 110} className={index === 0 ? "md:col-span-2" : ""}>
              <Link
                href={`/collections/${collection.slug}`}
                className="group flex h-full flex-col justify-between border border-ink/10 bg-bone-2/40 p-5 transition-colors duration-500 hover:border-ink/25 hover:bg-bone-2"
              >
                <div className="zoom-frame relative aspect-[5/4] w-full">
                  <Image
                    src={collection.image}
                    alt={collection.name}
                    fill
                    sizes="(min-width: 1024px) 26vw, (min-width: 768px) 45vw, 90vw"
                    className="object-cover"
                  />
                </div>
                <div className="mt-5 flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-display text-2xl transition-colors group-hover:text-ochre">
                      {collection.name}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-ash">{collection.tagline}</p>
                  </div>
                  <span className="mt-1 shrink-0 text-ochre opacity-0 transition-all duration-500 group-hover:translate-x-1 group-hover:opacity-100">
                    →
                  </span>
                </div>
                <p className="mt-4 border-t border-ink/10 pt-3 text-[11px] tracking-[0.16em] uppercase text-ash-2">
                  {collection.count} works
                </p>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------------- featured works ---------------- */}
      <section className="border-y border-ink/10 bg-bone-2/40 py-20 md:py-28">
        <div className="container-x">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <Reveal>
              <p className="eyebrow text-ash">On the wall now</p>
              <h2 className="mt-3 font-display text-[clamp(2rem,4vw,3.25rem)] leading-[1.05]">
                Featured works
              </h2>
            </Reveal>
            <Reveal delay={100}>
              <Link href="/shop" className="link-underline eyebrow text-ochre">
                View all {stats.works} works →
              </Link>
            </Reveal>
          </div>

          <div className="mt-12 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((product, index) => (
              <Reveal key={product.id} delay={(index % 3) * 110}>
                <ProductCard product={product} priority={index < 2} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- artist spotlight ---------------- */}
      <section className="container-x grid gap-12 py-20 md:py-28 lg:grid-cols-[1.05fr_1fr] lg:items-center">
        <Reveal>
          <div className="zoom-frame relative aspect-[4/3] w-full">
            <Image
              src="/art/studio.jpg"
              alt="Pigments, palette knives and linen in the studio"
              fill
              sizes="(min-width: 1024px) 48vw, 92vw"
              className="object-cover"
            />
          </div>
        </Reveal>

        <div>
          <Reveal>
            <p className="eyebrow text-ash">The makers</p>
            <h2 className="mt-3 font-display text-[clamp(2rem,4vw,3.25rem)] leading-[1.05]">
              Six artists, three continents, one room
            </h2>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-ink-2">
              We represent {stats.artists} artists working between Cape Town, Accra, Cairo, Oslo, Valencia and
              Johannesburg. Two are local to us; four we import by hand, wrapped in wool blankets on a plane
              seat when the crate is too slow. Everything is bought directly, at a fair split.
            </p>
          </Reveal>

          <div className="mt-10 space-y-5">
            {spotlight.map((artist, index) => (
              <Reveal key={artist.slug} delay={index * 120}>
                <Link
                  href={`/shop?artist=${artist.slug}`}
                  className="group flex items-center gap-5 border-t border-ink/10 pt-5"
                >
                  <span className="relative h-16 w-14 shrink-0 overflow-hidden bg-bone-2">
                    <Image
                      src={artist.image}
                      alt={artist.name}
                      fill
                      sizes="56px"
                      className="object-cover transition duration-700 group-hover:scale-105"
                    />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-display text-xl transition-colors group-hover:text-ochre">
                      {artist.name}
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-ash">{artist.location}</span>
                  </span>
                  <span className="shrink-0 text-[11px] tracking-[0.16em] uppercase text-ash-2">
                    {artist.count} works
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>

          <Reveal delay={400}>
            <Link href="/artists" className="btn-outline mt-10">
              Meet all the artists
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ---------------- new arrivals strip ---------------- */}
      {arrivals.length > 0 && (
        <section className="border-y border-ink/10 bg-bone-2/40 py-20">
          <div className="container-x">
            <Reveal>
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="eyebrow text-ash">Fresh in</p>
                  <h2 className="mt-3 font-display text-[clamp(1.75rem,3vw,2.5rem)]">New this month</h2>
                </div>
                <p className="text-sm text-ash">
                  From {formatPrice(Math.min(...arrivals.map((item) => item.priceCents)))} to{" "}
                  {formatPrice(Math.max(...arrivals.map((item) => item.priceCents)))}
                </p>
              </div>
            </Reveal>

            <div className="mt-10 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
              {arrivals.map((product, index) => (
                <Reveal key={product.id} delay={index * 100}>
                  <ProductCard product={product} sizes="(min-width: 1024px) 22vw, 45vw" />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ---------------- guarantees ---------------- */}
      <section className="container-x grid gap-10 py-20 md:grid-cols-3 md:py-28">
        {GUARANTEES.map((item, index) => (
          <Reveal key={item.title} delay={index * 120}>
            <div className="border-t border-ink/15 pt-6">
              <h3 className="font-display text-2xl">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-ash">{item.body}</p>
            </div>
          </Reveal>
        ))}
      </section>

      {/* ---------------- visit ---------------- */}
      <section className="relative isolate overflow-hidden bg-ochre-deep text-bone">
        <div className="grain absolute inset-0" />
        <div className="container-x relative grid gap-10 py-20 md:grid-cols-2 md:py-24">
          <div>
            <Reveal>
              <p className="eyebrow text-bone/60">Come and stand in front of it</p>
              <h2 className="mt-4 max-w-md font-display text-[clamp(2rem,4vw,3.25rem)] leading-[1.05]">
                {heroCollection ? heroCollection.name : "Terra & Ochre"} opens the week
              </h2>
              <p className="mt-6 max-w-md text-base leading-relaxed text-bone/75">
                The gallery is open {SITE.hours}. Walk in, or book a private viewing and we will have the work
                off the wall and waiting for you with the lights set.
              </p>
              <div className="mt-9 flex flex-wrap gap-4">
                <Link
                  href="/about"
                  className="btn-outline border-bone/45 text-bone hover:border-bone hover:bg-bone hover:text-ochre-deep"
                >
                  Plan your visit
                </Link>
                <a href={`mailto:${SITE.email}`} className="btn-outline border-bone/45 text-bone hover:border-bone hover:bg-bone hover:text-ochre-deep">
                  Book a viewing
                </a>
              </div>
            </Reveal>
          </div>

          <Reveal delay={150}>
            <dl className="grid gap-6 border-l border-bone/25 pl-8 sm:grid-cols-2">
              <div>
                <dt className="eyebrow text-bone/55">Address</dt>
                <dd className="mt-2 text-sm leading-relaxed text-bone/85">
                  {SITE.address}
                  <br />
                  {SITE.city}
                </dd>
              </div>
              <div>
                <dt className="eyebrow text-bone/55">Hours</dt>
                <dd className="mt-2 text-sm leading-relaxed text-bone/85">{SITE.hours}</dd>
              </div>
              <div>
                <dt className="eyebrow text-bone/55">Telephone</dt>
                <dd className="mt-2 text-sm leading-relaxed text-bone/85">
                  {SITE.phone}
                  <br />
                  WhatsApp {SITE.whatsapp}
                </dd>
              </div>
              <div>
                <dt className="eyebrow text-bone/55">Freight</dt>
                <dd className="mt-2 text-sm leading-relaxed text-bone/85">
                  Insured worldwide, crated and duties included above $4,500.
                </dd>
              </div>
            </dl>
          </Reveal>
        </div>
      </section>
    </>
  );
}
