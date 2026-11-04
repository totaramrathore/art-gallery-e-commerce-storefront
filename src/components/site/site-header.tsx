"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "@/components/cart/cart-context";
import { NAV_COLLECTIONS, SITE } from "@/lib/site";

const LINKS = [
  { href: "/shop", label: "All works" },
  { href: "/collections", label: "Collections" },
  { href: "/artists", label: "Artists" },
  { href: "/about", label: "Visit us" },
];

export function SiteHeader() {
  const { cart, openCart } = useCart();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [collectionsOpen, setCollectionsOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setCollectionsOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <div className="hidden bg-ink px-4 py-2 text-center text-[11px] tracking-[0.18em] text-bone/80 uppercase md:block">
        Complimentary insured courier in South Africa above $2,500 · Crated worldwide freight from Cape Town
      </div>

      <header
        className={`sticky top-0 z-50 transition-all duration-500 ${
          scrolled
            ? "border-b border-ink/10 bg-bone/92 backdrop-blur-md"
            : "border-b border-transparent bg-bone"
        }`}
      >
        <div className="container-x flex h-18 items-center justify-between gap-6">
          <Link href="/" className="group flex flex-col leading-none">
            <span className="font-display text-[1.35rem] tracking-tight transition-colors group-hover:text-ochre">
              Ochre <span className="text-ochre">&amp;</span> Ash
            </span>
            <span className="mt-1 hidden text-[10px] tracking-[0.32em] text-ash uppercase sm:block">
              Gallery · Cape Town
            </span>
          </Link>

          <nav className="hidden items-center gap-8 lg:flex">
            {LINKS.map((link) =>
              link.label === "Collections" ? (
                <div
                  key={link.href}
                  className="relative"
                  onMouseEnter={() => setCollectionsOpen(true)}
                  onMouseLeave={() => setCollectionsOpen(false)}
                >
                  <Link
                    href="/collections"
                    className="link-underline flex items-center gap-1 py-6 text-[12px] tracking-[0.18em] uppercase text-ink-2"
                    aria-expanded={collectionsOpen}
                  >
                    Collections
                    <svg width="8" height="5" viewBox="0 0 8 5" aria-hidden className="mt-0.5 opacity-60">
                      <path d="M1 1l3 3 3-3" fill="none" stroke="currentColor" strokeWidth="1.2" />
                    </svg>
                  </Link>

                  <div
                    className={`absolute left-1/2 top-full w-[19rem] -translate-x-1/2 origin-top border border-ink/10 bg-bone p-2 shadow-[var(--shadow-soft)] transition-all duration-300 ${
                      collectionsOpen
                        ? "pointer-events-auto translate-y-0 opacity-100"
                        : "pointer-events-none -translate-y-2 opacity-0"
                    }`}
                  >
                    {NAV_COLLECTIONS.map((collection) => (
                      <Link
                        key={collection.slug}
                        href={`/collections/${collection.slug}`}
                        className="group flex items-baseline justify-between gap-4 px-4 py-3 transition-colors hover:bg-bone-2"
                      >
                        <span>
                          <span className="block font-display text-lg group-hover:text-ochre">
                            {collection.name}
                          </span>
                          <span className="mt-0.5 block text-xs text-ash">{collection.blurb}</span>
                        </span>
                        <span className="text-ochre opacity-0 transition group-hover:opacity-100">→</span>
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`link-underline text-[12px] tracking-[0.18em] uppercase ${
                    pathname === link.href ? "text-ochre" : "text-ink-2"
                  }`}
                >
                  {link.label}
                </Link>
              ),
            )}
          </nav>

          <div className="flex items-center gap-3 sm:gap-5">
            <Link
              href="/shop"
              aria-label="Search the collection"
              className="hidden text-ink-2 transition hover:text-ochre sm:block"
            >
              <svg width="17" height="17" viewBox="0 0 20 20" fill="none" aria-hidden>
                <circle cx="8.5" cy="8.5" r="6" stroke="currentColor" strokeWidth="1.4" />
                <path d="M13.5 13.5L18 18" stroke="currentColor" strokeWidth="1.4" />
              </svg>
            </Link>

            <button
              type="button"
              onClick={openCart}
              className="group flex items-center gap-2 text-[12px] tracking-[0.18em] uppercase text-ink-2 transition hover:text-ochre"
              aria-label={`Open cart, ${cart.itemCount} items`}
            >
              <span className="hidden sm:inline">Cart</span>
              <span
                key={cart.itemCount}
                className="rise-in inline-flex h-7 min-w-7 items-center justify-center rounded-full border border-ink/20 px-2 text-[11px] tabular-nums transition-colors group-hover:border-ochre group-hover:text-ochre"
              >
                {cart.itemCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              className="flex h-9 w-9 items-center justify-center text-ink lg:hidden"
            >
              <span className="flex flex-col gap-[5px]">
                <span className="block h-[1.5px] w-6 bg-current" />
                <span className="block h-[1.5px] w-6 bg-current" />
                <span className="block h-[1.5px] w-4 bg-current" />
              </span>
            </button>
          </div>
        </div>
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-[80] lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
            className="fade-in absolute inset-0 bg-ink/45 backdrop-blur-[2px]"
          />
          <div className="drawer-panel absolute inset-y-0 right-0 flex h-full w-[86%] max-w-sm flex-col bg-bone px-6 py-6">
            <div className="flex items-center justify-between">
              <span className="eyebrow text-ash">Menu</span>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="rounded-full border border-ink/20 px-3 py-1 text-xs tracking-[0.16em] uppercase"
              >
                Close
              </button>
            </div>

            <nav className="mt-8 flex flex-col gap-5">
              {LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="font-display text-3xl text-ink transition hover:text-ochre"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="mt-8 border-t border-ink/10 pt-6">
              <p className="eyebrow text-ash">Collections</p>
              <div className="mt-4 flex flex-col gap-3">
                {NAV_COLLECTIONS.map((collection) => (
                  <Link
                    key={collection.slug}
                    href={`/collections/${collection.slug}`}
                    className="flex items-baseline justify-between text-sm"
                  >
                    <span>{collection.name}</span>
                    <span className="text-xs text-ash-2">{collection.blurb}</span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="mt-auto space-y-1 border-t border-ink/10 pt-6 text-xs leading-relaxed text-ash">
              <p>{SITE.address}</p>
              <p>{SITE.city}</p>
              <p>{SITE.hours}</p>
              <p>{SITE.phone}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
