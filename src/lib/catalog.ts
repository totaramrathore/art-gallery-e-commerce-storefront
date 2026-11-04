/** Shared, dependency-free catalog constants — safe to import from client components. */

export const SORT_OPTIONS = [
  { id: "featured", label: "Curator's pick" },
  { id: "newest", label: "Newest arrivals" },
  { id: "price-asc", label: "Price: low to high" },
  { id: "price-desc", label: "Price: high to low" },
  { id: "rating", label: "Best reviewed" },
  { id: "title", label: "Title A–Z" },
] as const;

export type SortId = (typeof SORT_OPTIONS)[number]["id"];

export const PRICE_BANDS = [
  { id: "under-500", label: "Under $500", min: 0, max: 50000 },
  { id: "500-1500", label: "$500 – $1,500", min: 50000, max: 150000 },
  { id: "1500-2500", label: "$1,500 – $2,500", min: 150000, max: 250000 },
  { id: "2500-plus", label: "$2,500 and above", min: 250000, max: 100000000 },
] as const;

export const MEDIUMS = ["Painting", "Works on Paper", "Ceramics", "Textile", "Print"] as const;
