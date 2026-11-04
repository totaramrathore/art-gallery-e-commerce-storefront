export function formatPrice(cents: number, options: { withDecimals?: boolean } = {}): string {
  const value = cents / 100;
  const hasFraction = Math.round(value * 100) % 100 !== 0;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: options.withDecimals || hasFraction ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatCompactPrice(cents: number): string {
  return `$${Math.round(cents / 100).toLocaleString("en-US")}`;
}

export function formatDate(value: Date | string): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function ratingFromTenths(tenths: number): string {
  return (tenths / 10).toFixed(1);
}

export function relativeTime(value: Date | string): string {
  const date = typeof value === "string" ? new Date(value) : value;
  const diff = Date.now() - date.getTime();
  const days = Math.floor(diff / (24 * 60 * 60 * 1000));
  if (days < 1) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months === 1 ? "" : "s"} ago`;
  const years = Math.floor(months / 12);
  return `${years} year${years === 1 ? "" : "s"} ago`;
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export const SHIPPING_OPTIONS = [
  {
    id: "pickup",
    label: "Collect from the gallery",
    detail: "23 Bree Street, Cape Town · Tue–Sat, 10:00–17:00",
    priceCents: 0,
    eta: "Ready within 24 hours",
  },
  {
    id: "domestic",
    label: "Insured courier — South Africa",
    detail: "Fully insured, tracked, crated where needed",
    priceCents: 3500,
    eta: "2–4 working days",
  },
  {
    id: "international",
    label: "Insured international express",
    detail: "Custom crate, export paperwork and duties included",
    priceCents: 18000,
    eta: "5–10 working days",
  },
] as const;

export type ShippingMethodId = (typeof SHIPPING_OPTIONS)[number]["id"];

export const FREE_DOMESTIC_THRESHOLD = 250000;
export const FREE_INTERNATIONAL_THRESHOLD = 450000;

export function shippingCostCents(methodId: string, subtotalCents: number): number {
  switch (methodId) {
    case "pickup":
      return 0;
    case "domestic":
      return subtotalCents >= FREE_DOMESTIC_THRESHOLD ? 0 : 3500;
    case "international":
      return subtotalCents >= FREE_INTERNATIONAL_THRESHOLD ? 0 : 18000;
    default:
      return 0;
  }
}

export function shippingOption(methodId: string) {
  return SHIPPING_OPTIONS.find((option) => option.id === methodId) ?? SHIPPING_OPTIONS[0];
}

export function orderNumber(): string {
  const stamp = Date.now().toString(36).toUpperCase().slice(-5);
  const rand = Math.random().toString(36).toUpperCase().slice(2, 5);
  return `OA-${stamp}${rand}`;
}
