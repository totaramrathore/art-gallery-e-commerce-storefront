import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { Reveal } from "@/components/ui/reveal";
import { getArtists } from "@/lib/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Artists",
  description:
    "The artists represented by Ochre & Ash Gallery — Cape Town, Accra, Cairo, Oslo, Valencia and Johannesburg.",
};

export default async function ArtistsPage() {
  const artists = await getArtists();

  return (
    <div className="container-x pb-24 pt-14 md:pt-20">
      <header className="max-w-3xl border-b border-ink/10 pb-12">
        <Reveal>
          <p className="eyebrow text-ash">Who we represent</p>
          <h1 className="mt-4 font-display text-[clamp(2.5rem,6vw,4.5rem)] leading-[0.98]">The artists</h1>
          <p className="mt-6 text-base leading-relaxed text-ash">
            We buy everything directly, split fairly, and never take work an artist is not ready to let go of.
            Two of our six live within walking distance of the gallery; the others we fetch ourselves when the
            crate is too slow.
          </p>
        </Reveal>
      </header>

      <div className="mt-14 grid gap-12 md:grid-cols-2 lg:grid-cols-3">
        {artists.map((artist, index) => (
          <Reveal key={artist.slug} delay={(index % 3) * 110}>
            <article className="group flex h-full flex-col">
              <Link href={`/shop?artist=${artist.slug}`} className="zoom-frame relative block aspect-[4/5] w-full">
                <Image
                  src={artist.image}
                  alt={artist.name}
                  fill
                  sizes="(min-width: 1024px) 30vw, (min-width: 768px) 45vw, 92vw"
                  className="object-cover"
                />
              </Link>
              <div className="mt-5 flex flex-1 flex-col">
                <div className="flex items-baseline justify-between gap-4">
                  <h2 className="font-display text-2xl transition-colors group-hover:text-ochre">
                    {artist.name}
                  </h2>
                  <span className="text-[11px] tracking-[0.14em] uppercase text-ash-2">
                    {artist.count} works
                  </span>
                </div>
                <p className="mt-1 text-xs text-ash">{artist.location}</p>
                <p className="mt-4 flex-1 text-sm leading-relaxed text-ink-2">{artist.bio}</p>
                <Link
                  href={`/shop?artist=${artist.slug}`}
                  className="eyebrow mt-6 inline-flex items-center gap-3 text-ochre"
                >
                  View work
                  <span className="transition-transform duration-500 group-hover:translate-x-1.5">→</span>
                </Link>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
