import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { Reveal } from "@/components/ui/reveal";
import { getCollections } from "@/lib/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Collections",
  description:
    "Five rooms of the Ochre & Ash Gallery: Terra & Ochre, Ash & Ink, Fired Clay, Woven Light and Studio Editions.",
};

export default async function CollectionsPage() {
  const collections = await getCollections();

  return (
    <div className="container-x pb-24 pt-14 md:pt-20">
      <header className="max-w-3xl border-b border-ink/10 pb-12">
        <Reveal>
          <p className="eyebrow text-ash">The rooms</p>
          <h1 className="mt-4 font-display text-[clamp(2.5rem,6vw,4.5rem)] leading-[0.98]">Collections</h1>
          <p className="mt-6 text-base leading-relaxed text-ash">
            We hang the gallery in five rooms, organised by material rather than by artist. Walk from raw
            earth pigment through charcoal and bone ash, into the ceramics room, past the loom, and finish
            with the editions bench where a first collection can begin at $180.
          </p>
        </Reveal>
      </header>

      <div className="mt-14 space-y-14 md:space-y-20">
        {collections.map((collection, index) => (
          <Reveal key={collection.slug} delay={60}>
            <Link
              href={`/collections/${collection.slug}`}
              className={`group grid gap-8 md:grid-cols-2 md:items-center ${
                index % 2 === 1 ? "md:[&>*:first-child]:order-2" : ""
              }`}
            >
              <div className="zoom-frame relative aspect-[4/3] w-full">
                <Image
                  src={collection.image}
                  alt={collection.name}
                  fill
                  sizes="(min-width: 768px) 48vw, 92vw"
                  className="object-cover"
                />
                <span
                  className="absolute inset-0 mix-blend-multiply opacity-15"
                  style={{ backgroundColor: collection.accent }}
                />
              </div>

              <div className="md:px-6">
                <p className="eyebrow text-ochre">{collection.count} works available</p>
                <h2 className="mt-4 font-display text-[clamp(1.9rem,3.6vw,3rem)] leading-[1.05] transition-colors group-hover:text-ochre">
                  {collection.name}
                </h2>
                <p className="mt-4 text-base leading-relaxed text-ink-2">{collection.tagline}</p>
                <p className="mt-4 max-w-md text-sm leading-relaxed text-ash">{collection.description}</p>
                <span className="eyebrow mt-8 inline-flex items-center gap-3 text-ink-2 transition group-hover:text-ochre">
                  Enter the room
                  <span className="transition-transform duration-500 group-hover:translate-x-1.5">→</span>
                </span>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
