"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { PRICE_BANDS, SORT_OPTIONS } from "@/lib/catalog";

type Facets = {
  collections: { slug: string; name: string; count: number }[];
  mediums: { medium: string; count: number }[];
  artists: { slug: string; name: string; location: string; count: number }[];
};

const SINGLE = ["collection", "medium", "artist", "price"] as const;

export function ShopControls({ facets, total }: { facets: Facets; total: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [mobileOpen, setMobileOpen] = useState(false);

  const current = (key: string) => searchParams.get(key) ?? "";

  const update = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (!value || params.get(key) === value) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    const query = params.toString();
    startTransition(() => {
      router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
    });
  };

  const activeCount = SINGLE.filter((key) => current(key)).length + (current("inStock") ? 1 : 0);
  const sort = current("sort") || "featured";

  const body = (
    <div className={`space-y-8 ${pending ? "opacity-50 transition-opacity" : "transition-opacity"}`}>
      <FilterGroup label="Collection">
        <button
          type="button"
          onClick={() => update("collection", null)}
          className={`flex w-full items-baseline justify-between py-1.5 text-left text-sm transition ${
            !current("collection") ? "text-ochre" : "text-ink-2 hover:text-ink"
          }`}
        >
          <span className="link-underline">All works</span>
          <span className="text-[11px] tabular-nums text-ash-2">{total}</span>
        </button>
        {facets.collections.map((collection) => (
          <button
            key={collection.slug}
            type="button"
            onClick={() => update("collection", collection.slug)}
            className={`flex w-full items-baseline justify-between gap-3 py-1.5 text-left text-sm transition ${
              current("collection") === collection.slug ? "text-ochre" : "text-ink-2 hover:text-ink"
            }`}
          >
            <span className="link-underline">{collection.name}</span>
            <span className="text-[11px] tabular-nums text-ash-2">{collection.count}</span>
          </button>
        ))}
      </FilterGroup>

      <FilterGroup label="Medium">
        {facets.mediums.map((item) => (
          <button
            key={item.medium}
            type="button"
            onClick={() => update("medium", item.medium)}
            className={`flex w-full items-baseline justify-between gap-3 py-1.5 text-left text-sm transition ${
              current("medium") === item.medium ? "text-ochre" : "text-ink-2 hover:text-ink"
            }`}
          >
            <span className="link-underline">{item.medium}</span>
            <span className="text-[11px] tabular-nums text-ash-2">{item.count}</span>
          </button>
        ))}
      </FilterGroup>

      <FilterGroup label="Price">
        {PRICE_BANDS.map((band) => (
          <button
            key={band.id}
            type="button"
            onClick={() => update("price", band.id)}
            className={`block w-full py-1.5 text-left text-sm transition ${
              current("price") === band.id ? "text-ochre" : "text-ink-2 hover:text-ink"
            }`}
          >
            <span className="link-underline">{band.label}</span>
          </button>
        ))}
      </FilterGroup>

      <FilterGroup label="Artist">
        <div className="space-y-1.5">
          {facets.artists.map((artist) => (
            <button
              key={artist.slug}
              type="button"
              onClick={() => update("artist", artist.slug)}
              className={`flex w-full flex-col py-1 text-left text-sm transition ${
                current("artist") === artist.slug ? "text-ochre" : "text-ink-2 hover:text-ink"
              }`}
            >
              <span className="link-underline">{artist.name}</span>
              <span className="text-[11px] text-ash-2">
                {artist.location} · {artist.count}
              </span>
            </button>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup label="Availability">
        <label className="flex cursor-pointer items-center gap-3 py-1.5 text-sm text-ink-2">
          <input
            type="checkbox"
            checked={current("inStock") === "1"}
            onChange={(event) => update("inStock", event.target.checked ? "1" : null)}
            className="h-3.5 w-3.5 appearance-none border border-ink/30 bg-transparent checked:border-ochre checked:bg-ochre"
          />
          Available now only
        </label>
      </FilterGroup>

      {activeCount > 0 && (
        <Link
          href={pathname}
          onClick={() => setMobileOpen(false)}
          className="eyebrow text-ochre hover:text-ink"
        >
          Clear all filters
        </Link>
      )}
    </div>
  );

  return (
    <>
      <aside className="hidden lg:block">
        <div className="sticky top-28 max-h-[calc(100vh-9rem)] overflow-y-auto pr-2 no-scrollbar">{body}</div>
      </aside>

      <div className="lg:hidden">
        <div className="flex items-center justify-between gap-4 border-b border-ink/10 pb-4">
          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            className="flex items-center gap-2 text-[11px] tracking-[0.18em] uppercase text-ink-2"
          >
            <svg width="14" height="12" viewBox="0 0 14 12" aria-hidden>
              <path d="M0 1h14M2 6h10M5 11h4" stroke="currentColor" strokeWidth="1.3" />
            </svg>
            Filters{activeCount > 0 ? ` (${activeCount})` : ""}
          </button>

          <SortSelect />
        </div>
        {mobileOpen && <div className="mt-6 border-t border-ink/10 pt-6">{body}</div>}
      </div>
    </>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="eyebrow mb-3 text-ash">{label}</p>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

export function SortSelect({ sort }: { sort?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const value = sort ?? searchParams.get("sort") ?? "featured";

  return (
    <label className="flex items-center gap-2 text-[11px] tracking-[0.18em] uppercase text-ink-2">
      <span>Sort</span>
      <select
        value={value}
        onChange={(event) => {
          const params = new URLSearchParams(searchParams.toString());
          if (event.target.value === "featured") params.delete("sort");
          else params.set("sort", event.target.value);
          const query = params.toString();
          router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
        }}
        className="field !py-1 text-[11px] tracking-[0.12em] uppercase"
        aria-label="Sort works"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
