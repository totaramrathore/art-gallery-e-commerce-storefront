import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { Reveal } from "@/components/ui/reveal";
import { getGalleryStats } from "@/lib/queries";
import { GUARANTEES, SITE } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Visit us",
  description:
    "Ochre & Ash Gallery — 23 Bree Street, Bo-Kaap, Cape Town. Opening hours, viewing appointments, freight, framing and returns.",
};

const FAQ = [
  {
    q: "Can I see a work before I buy it?",
    a: "Always. Reserve anything on this site and we will hold it for 48 hours while you come in, or arrange a video walkthrough on WhatsApp if you are buying from overseas.",
  },
  {
    q: "How do you ship paintings?",
    a: "Works on canvas are rolled in acid-free tissue and sent in a rigid tube, or crated flat for larger linen. Ceramics are double-boxed with foam cut to the piece. Everything is insured door to door.",
  },
  {
    q: "Do you frame?",
    a: "We frame works on paper in Cape Town with a local framer (oak, ash or powder-coated aluminium) and can quote before you buy. Paintings are sold unframed unless stated.",
  },
  {
    q: "What if it does not work in the room?",
    a: "Tell us within seven days of delivery. We arrange collection, refund in full, and cover the return freight within South Africa.",
  },
  {
    q: "Do you offer payment plans?",
    a: "Yes — three equal monthly payments on works above $1,500, interest free. Email us and we will set it up the same day.",
  },
];

export default async function AboutPage() {
  const stats = await getGalleryStats();

  return (
    <div>
      <section className="container-x grid gap-12 pt-14 md:pt-20 lg:grid-cols-[1.1fr_1fr] lg:items-center">
        <div>
          <Reveal>
            <p className="eyebrow text-ash">Since {SITE.since}</p>
            <h1 className="mt-4 font-display text-[clamp(2.5rem,6vw,4.25rem)] leading-[0.98]">
              A gallery that started as a pigment grinder
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-ink-2">
              Ochre &amp; Ash began in a Bree Street back room when Thandiwe Mkhize needed somewhere to grind
              Karoo clay into paint. Ten years later the room is a gallery, the pigment bench is still in the
              corner, and everything we sell is made by hand by someone we can phone.
            </p>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-ash">
              We keep the floor deliberately small — around {stats.works} works from {stats.artists} artists —
              because we would rather know every piece than stock a warehouse. Locals collect here on a
              Saturday morning; collectors in {stats.countries} cities buy the same work, crated, insured and
              fully duty-paid.
            </p>
          </Reveal>

          <Reveal delay={160}>
            <dl className="mt-10 grid grid-cols-3 gap-6 border-t border-ink/10 pt-8">
              <div>
                <dt className="font-display text-4xl">{stats.works}</dt>
                <dd className="mt-1 text-[11px] tracking-[0.16em] uppercase text-ash-2">Works available</dd>
              </div>
              <div>
                <dt className="font-display text-4xl">{stats.reviewCount}</dt>
                <dd className="mt-1 text-[11px] tracking-[0.16em] uppercase text-ash-2">Collector notes</dd>
              </div>
              <div>
                <dt className="font-display text-4xl">{stats.artists}</dt>
                <dd className="mt-1 text-[11px] tracking-[0.16em] uppercase text-ash-2">Artists</dd>
              </div>
            </dl>
          </Reveal>
        </div>

        <Reveal delay={120}>
          <div className="zoom-frame relative aspect-[4/5] w-full">
            <Image
              src="/art/studio.jpg"
              alt="The pigment bench at Ochre & Ash"
              fill
              priority
              sizes="(min-width: 1024px) 46vw, 92vw"
              className="object-cover"
            />
          </div>
        </Reveal>
      </section>

      <section className="mt-24 border-y border-ink/10 bg-bone-2/40">
        <div className="container-x grid gap-10 py-16 md:grid-cols-3">
          {GUARANTEES.map((item, index) => (
            <Reveal key={item.title} delay={index * 110}>
              <div className="border-t border-ink/15 pt-6">
                <h2 className="font-display text-2xl">{item.title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-ash">{item.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="container-x grid gap-14 py-20 md:py-24 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <Reveal>
            <p className="eyebrow text-ash">Visit</p>
            <h2 className="mt-3 font-display text-[clamp(1.9rem,3.6vw,3rem)] leading-[1.05]">
              23 Bree Street, Bo-Kaap
            </h2>
            <ul className="mt-7 space-y-3 text-sm leading-relaxed text-ink-2">
              <li>
                <span className="text-ash">Address · </span>
                {SITE.address}, {SITE.city}
              </li>
              <li>
                <span className="text-ash">Hours · </span>
                {SITE.hours} (and by appointment)
              </li>
              <li>
                <span className="text-ash">Telephone · </span>
                <a href={`tel:${SITE.phone.replace(/\s/g, "")}`} className="link-underline">
                  {SITE.phone}
                </a>
              </li>
              <li>
                <span className="text-ash">WhatsApp · </span>
                {SITE.whatsapp}
              </li>
              <li>
                <span className="text-ash">Email · </span>
                <a href={`mailto:${SITE.email}`} className="link-underline">
                  {SITE.email}
                </a>
              </li>
            </ul>
            <div className="mt-9 flex flex-wrap gap-4">
              <Link href="/shop" className="btn-ink">
                Browse available work
              </Link>
              <a href={`mailto:${SITE.email}?subject=Viewing%20appointment`} className="btn-outline">
                Book a viewing
              </a>
            </div>
          </Reveal>
        </div>

        <div>
          <Reveal>
            <p className="eyebrow text-ash">Good to know</p>
            <h2 className="mt-3 font-display text-3xl">Questions we get every week</h2>
          </Reveal>
          <div className="mt-8 divide-y divide-ink/10">
            {FAQ.map((item, index) => (
              <Reveal key={item.q} delay={index * 80}>
                <details className="group py-5">
                  <summary className="flex cursor-pointer items-start justify-between gap-6 font-display text-lg marker:content-['']">
                    {item.q}
                    <span className="mt-1 text-ash transition-transform duration-300 group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-3 max-w-xl text-sm leading-relaxed text-ash">{item.a}</p>
                </details>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
