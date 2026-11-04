"use client";

import Link from "next/link";
import { useState } from "react";
import { NAV_COLLECTIONS, SITE } from "@/lib/site";

export function SiteFooter() {
  const [email, setEmail] = useState("");
  const [joined, setJoined] = useState(false);

  return (
    <footer className="border-t border-ink/10 bg-ink text-bone">
      <div className="container-x grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-4 lg:py-20">
        <div>
          <p className="font-display text-2xl">
            Ochre <span className="text-ochre-2">&amp;</span> Ash
          </p>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-bone/65">
            A small gallery on Bree Street for original work made with earth pigment, sifted ash, clay and
            thread. Est. {SITE.since}.
          </p>
          <div className="mt-6 flex gap-5 text-[11px] tracking-[0.18em] uppercase text-bone/60">
            <a href="#" className="link-underline hover:text-ochre-2">
              Instagram
            </a>
            <a href="#" className="link-underline hover:text-ochre-2">
              Pinterest
            </a>
            <a href="#" className="link-underline hover:text-ochre-2">
              Journal
            </a>
          </div>
        </div>

        <div>
          <p className="eyebrow text-bone/45">Collections</p>
          <ul className="mt-5 space-y-3 text-sm text-bone/70">
            {NAV_COLLECTIONS.map((collection) => (
              <li key={collection.slug}>
                <Link href={`/collections/${collection.slug}`} className="link-underline hover:text-ochre-2">
                  {collection.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="eyebrow text-bone/45">Visit &amp; contact</p>
          <ul className="mt-5 space-y-3 text-sm text-bone/70">
            <li>{SITE.address}</li>
            <li>{SITE.city}</li>
            <li>{SITE.hours}</li>
            <li>
              <a href={`tel:${SITE.phone.replace(/\s/g, "")}`} className="link-underline hover:text-ochre-2">
                {SITE.phone}
              </a>
            </li>
            <li>
              <a href={`mailto:${SITE.email}`} className="link-underline hover:text-ochre-2">
                {SITE.email}
              </a>
            </li>
          </ul>
        </div>

        <div>
          <p className="eyebrow text-bone/45">Friday catalogue</p>
          <p className="mt-5 text-sm leading-relaxed text-bone/65">
            One email each Friday: new arrivals, price reductions and what is on the wall this week.
          </p>
          {joined ? (
            <p className="mt-5 border border-ochre-2/40 bg-ochre-2/10 px-4 py-3 text-sm text-ochre-2">
              Thank you — the next catalogue reaches you on Friday.
            </p>
          ) : (
            <form
              className="mt-5"
              onSubmit={(event) => {
                event.preventDefault();
                if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) setJoined(true);
              }}
            >
              <label htmlFor="footer-email" className="sr-only">
                Email address
              </label>
              <div className="flex items-center gap-3 border-b border-bone/25 focus-within:border-ochre-2">
                <input
                  id="footer-email"
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@email.com"
                  className="w-full bg-transparent py-2 text-sm text-bone placeholder:text-bone/35 focus:outline-none"
                />
                <button
                  type="submit"
                  className="pb-1 text-[11px] tracking-[0.18em] uppercase text-ochre-2 hover:text-bone"
                >
                  Join
                </button>
              </div>
            </form>
          )}
          <p className="mt-4 text-xs text-bone/40">No resale, no spam. Unsubscribe in one click.</p>
        </div>
      </div>

      <div className="container-x flex flex-col gap-3 border-t border-bone/10 py-6 text-[11px] tracking-[0.14em] uppercase text-bone/40 md:flex-row md:items-center md:justify-between">
        <p>© {new Date().getFullYear()} Ochre &amp; Ash Gallery (Pty) Ltd · Cape Town</p>
        <p>Prices in USD · Duties included · Secure payment</p>
      </div>
    </footer>
  );
}
