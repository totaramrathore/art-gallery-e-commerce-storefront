"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useCart } from "@/components/cart/cart-context";
import {
  formatPrice,
  FREE_DOMESTIC_THRESHOLD,
  FREE_INTERNATIONAL_THRESHOLD,
  shippingCostCents,
  SHIPPING_OPTIONS,
} from "@/lib/format";

const STEPS = ["Contact", "Delivery", "Payment"] as const;

type FieldErrors = Record<string, string>;

export default function CheckoutPage() {
  const { cart, hydrated, setQuantity, removeItem, sync } = useCart();
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [values, setValues] = useState({
    fullName: "",
    email: "",
    phone: "",
    address1: "",
    address2: "",
    city: "",
    region: "",
    postalCode: "",
    country: "South Africa",
    notes: "",
    cardName: "",
    cardNumber: "",
    cardExpiry: "",
    cardCvc: "",
  });
  const [shippingMethod, setShippingMethod] = useState<string>("pickup");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const set = (key: keyof typeof values, value: string) => {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: "" }));
  };

  const shippingCents = useMemo(
    () => shippingCostCents(shippingMethod, cart.subtotalCents),
    [shippingMethod, cart.subtotalCents],
  );
  const totalCents = cart.subtotalCents + shippingCents;

  const validateStep = (index: number): boolean => {
    const next: FieldErrors = {};

    if (index === 0) {
      if (values.fullName.trim().length < 2) next.fullName = "Please tell us your name.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim()))
        next.email = "A valid email is needed for your certificate.";
    }

    if (index === 1 && shippingMethod !== "pickup") {
      if (values.address1.trim().length < 4) next.address1 = "Street address is required.";
      if (values.city.trim().length < 2) next.city = "City is required.";
      if (values.postalCode.trim().length < 3) next.postalCode = "Postal code is required.";
      if (values.country.trim().length < 2) next.country = "Country is required.";
    }

    if (index === 2) {
      const digits = values.cardNumber.replace(/\s/g, "");
      if (values.cardName.trim().length < 2) next.cardName = "Name on card is required.";
      if (digits.length < 15 || !/^\d+$/.test(digits)) next.cardNumber = "Enter a 16-digit card number.";
      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(values.cardExpiry)) next.cardExpiry = "Use MM/YY.";
      if (!/^\d{3,4}$/.test(values.cardCvc)) next.cardCvc = "3 or 4 digits.";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const goNext = () => {
    if (!validateStep(step)) return;
    setStep((current) => Math.min(current + 1, STEPS.length - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const placeOrder = async () => {
    if (!validateStep(0) || !validateStep(1) || !validateStep(2)) {
      setStep(0);
      return;
    }

    setSubmitting(true);
    setServerError(null);

    try {
      // Push the basket to the server first, then send the same lines with the
      // order as a fallback so a blocked or missing cart cookie cannot lose it.
      const synced = await sync();
      const items = synced.lines.map((line) => ({
        productId: line.productId,
        quantity: line.quantity,
      }));

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, shippingMethod, items }),
      });
      const data = (await response.json()) as { ok: boolean; orderNumber?: string; error?: string };

      if (!data.ok || !data.orderNumber) {
        setServerError(data.error ?? "We could not place your order.");
        return;
      }

      router.push(`/order/${data.orderNumber}`);
    } catch {
      setServerError("Network hiccup — please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (hydrated && cart.lines.length === 0) {
    return (
      <div className="container-x flex min-h-[70vh] flex-col items-center justify-center py-24 text-center">
        <p className="eyebrow text-ash">Checkout</p>
        <h1 className="mt-4 font-display text-[clamp(2rem,5vw,3.5rem)]">Your cart is empty</h1>
        <p className="mt-4 max-w-md text-base leading-relaxed text-ash">
          Nothing has been reserved yet. Take a look at what is on the wall — most works are one of one.
        </p>
        <Link href="/shop" className="btn-ink mt-9">
          Browse the collection
        </Link>
      </div>
    );
  }

  return (
    <div className="container-x pb-24 pt-12 md:pt-16">
      <header className="border-b border-ink/10 pb-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow text-ash">Secure checkout</p>
            <h1 className="mt-3 font-display text-[clamp(2.25rem,5vw,3.5rem)] leading-[1.02]">
              Reserve your work
            </h1>
          </div>
          <ol className="flex items-center gap-4 text-[11px] tracking-[0.16em] uppercase">
            {STEPS.map((label, index) => (
              <li key={label} className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => index < step && setStep(index)}
                  className={`flex items-center gap-2 ${
                    index === step
                      ? "text-ink"
                      : index < step
                        ? "text-ochre hover:text-ink"
                        : "text-ash-2"
                  }`}
                >
                  <span
                    className={`inline-flex h-6 w-6 items-center justify-center rounded-full border text-[10px] tabular-nums ${
                      index === step
                        ? "border-ink bg-ink text-bone"
                        : index < step
                          ? "border-ochre text-ochre"
                          : "border-ink/20"
                    }`}
                  >
                    {index < step ? "✓" : index + 1}
                  </span>
                  <span className="hidden sm:inline">{label}</span>
                </button>
                {index < STEPS.length - 1 && <span className="text-ash-2">—</span>}
              </li>
            ))}
          </ol>
        </div>
      </header>

      <div className="mt-10 grid gap-12 lg:grid-cols-[1.35fr_1fr] lg:gap-16">
        <div>
          {/* ---------- step 1 ---------- */}
          {step === 0 && (
            <section className="fade-in">
              <h2 className="font-display text-2xl">Who are we sending this to?</h2>
              <div className="mt-7 space-y-7">
                <Field
                  label="Full name"
                  value={values.fullName}
                  onChange={(value) => set("fullName", value)}
                  error={errors.fullName}
                  placeholder="Thandiwe Mkhize"
                  autoComplete="name"
                />
                <Field
                  label="Email"
                  type="email"
                  value={values.email}
                  onChange={(value) => set("email", value)}
                  error={errors.email}
                  placeholder="you@email.com"
                  autoComplete="email"
                  hint="Your certificate and freight tracking go here."
                />
                <Field
                  label="Telephone (optional)"
                  value={values.phone}
                  onChange={(value) => set("phone", value)}
                  error={errors.phone}
                  placeholder="+27 82 551 0042"
                  autoComplete="tel"
                  hint="The courier prefers a number. So do we."
                />
              </div>
              <button type="button" onClick={goNext} className="btn-ink mt-10">
                Continue to delivery
              </button>
            </section>
          )}

          {/* ---------- step 2 ---------- */}
          {step === 1 && (
            <section className="fade-in">
              <h2 className="font-display text-2xl">How should it travel?</h2>

              <div className="mt-7 space-y-3">
                {SHIPPING_OPTIONS.map((option) => {
                  const cost = shippingCostCents(option.id, cart.subtotalCents);
                  const active = shippingMethod === option.id;
                  return (
                    <label
                      key={option.id}
                      className={`flex cursor-pointer items-start gap-4 border p-5 transition-colors ${
                        active ? "border-ochre bg-ochre/6" : "border-ink/15 hover:border-ink/35"
                      }`}
                    >
                      <input
                        type="radio"
                        name="shipping"
                        checked={active}
                        onChange={() => setShippingMethod(option.id)}
                        className="mt-1 h-3.5 w-3.5 appearance-none rounded-full border border-ink/40 checked:border-ochre checked:bg-ochre"
                      />
                      <span className="flex-1">
                        <span className="flex flex-wrap items-baseline justify-between gap-3">
                          <span className="font-display text-lg">{option.label}</span>
                          <span className="text-sm tabular-nums">
                            {cost === 0 ? "Complimentary" : formatPrice(cost)}
                          </span>
                        </span>
                        <span className="mt-1 block text-xs leading-relaxed text-ash">
                          {option.detail} · {option.eta}
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>

              {shippingMethod !== "pickup" && (
                <div className="fade-in mt-9 grid gap-7 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Field
                      label="Street address"
                      value={values.address1}
                      onChange={(value) => set("address1", value)}
                      error={errors.address1}
                      placeholder="14 Kloof Nek Road"
                      autoComplete="address-line1"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Field
                      label="Apartment, studio, notes for the courier (optional)"
                      value={values.address2}
                      onChange={(value) => set("address2", value)}
                      error={errors.address2}
                      placeholder="Unit 3B, buzzer 4"
                      autoComplete="address-line2"
                    />
                  </div>
                  <Field
                    label="City"
                    value={values.city}
                    onChange={(value) => set("city", value)}
                    error={errors.city}
                    placeholder="Cape Town"
                    autoComplete="address-level2"
                  />
                  <Field
                    label="Region / province"
                    value={values.region}
                    onChange={(value) => set("region", value)}
                    error={errors.region}
                    placeholder="Western Cape"
                    autoComplete="address-level1"
                  />
                  <Field
                    label="Postal code"
                    value={values.postalCode}
                    onChange={(value) => set("postalCode", value)}
                    error={errors.postalCode}
                    placeholder="8001"
                    autoComplete="postal-code"
                  />
                  <Field
                    label="Country"
                    value={values.country}
                    onChange={(value) => set("country", value)}
                    error={errors.country}
                    autoComplete="country-name"
                  />
                </div>
              )}

              <label className="mt-9 block">
                <span className="text-[11px] tracking-[0.16em] uppercase text-ash">
                  Anything we should know? (optional)
                </span>
                <textarea
                  rows={3}
                  value={values.notes}
                  onChange={(event) => set("notes", event.target.value)}
                  className="field resize-none"
                  placeholder="Framing, gift wrapping, a hand-written card…"
                />
              </label>

              <div className="mt-10 flex flex-wrap gap-4">
                <button type="button" onClick={() => setStep(0)} className="btn-outline">
                  Back
                </button>
                <button type="button" onClick={goNext} className="btn-ink">
                  Continue to payment
                </button>
              </div>
            </section>
          )}

          {/* ---------- step 3 ---------- */}
          {step === 2 && (
            <section className="fade-in">
              <h2 className="font-display text-2xl">Payment</h2>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-ash">
                This is a demonstration storefront — no card is charged and no data leaves this server. Use
                any 16 digits you like.
              </p>

              <div className="mt-7 space-y-7">
                <Field
                  label="Name on card"
                  value={values.cardName}
                  onChange={(value) => set("cardName", value)}
                  error={errors.cardName}
                  placeholder="T. MKHIZE"
                  autoComplete="cc-name"
                />
                <Field
                  label="Card number"
                  value={values.cardNumber}
                  onChange={(value) =>
                    set(
                      "cardNumber",
                      value
                        .replace(/[^\d]/g, "")
                        .slice(0, 16)
                        .replace(/(\d{4})(?=\d)/g, "$1 "),
                    )
                  }
                  error={errors.cardNumber}
                  placeholder="4242 4242 4242 4242"
                  autoComplete="cc-number"
                />
                <div className="grid grid-cols-2 gap-7">
                  <Field
                    label="Expiry"
                    value={values.cardExpiry}
                    onChange={(value) => {
                      const digits = value.replace(/[^\d]/g, "").slice(0, 4);
                      set(
                        "cardExpiry",
                        digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits,
                      );
                    }}
                    error={errors.cardExpiry}
                    placeholder="09/29"
                    autoComplete="cc-exp"
                  />
                  <Field
                    label="CVC"
                    value={values.cardCvc}
                    onChange={(value) => set("cardCvc", value.replace(/[^\d]/g, "").slice(0, 4))}
                    error={errors.cardCvc}
                    placeholder="123"
                    autoComplete="cc-csc"
                  />
                </div>
              </div>

              {serverError && (
                <p className="mt-7 border border-clay/40 bg-clay/8 px-4 py-3 text-sm text-clay">
                  {serverError}
                </p>
              )}

              <div className="mt-10 flex flex-wrap gap-4">
                <button type="button" onClick={() => setStep(1)} className="btn-outline">
                  Back
                </button>
                <button type="button" onClick={placeOrder} disabled={submitting} className="btn-ink">
                  {submitting
                    ? "Placing order…"
                    : `Place order · ${formatPrice(totalCents)}`}
                </button>
              </div>

              <p className="mt-5 text-xs leading-relaxed text-ash">
                By placing this order you agree to our seven-day viewing period. Nothing is charged until the
                work is dispatched.
              </p>
            </section>
          )}
        </div>

        {/* ---------- summary ---------- */}
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="border border-ink/12 bg-bone-2/45 p-6">
            <p className="eyebrow text-ash">Order summary</p>

            <ul className="mt-6 space-y-5">
              {cart.lines.map((line) => (
                <li key={line.productId} className="flex gap-4">
                  <Link
                    href={`/products/${line.slug}`}
                    className="relative h-20 shrink-0 overflow-hidden bg-bone-3"
                    style={{ width: "4rem" }}
                  >
                    <Image src={line.image} alt={line.title} fill sizes="64px" className="object-cover" />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <p className="truncate font-display text-base">{line.title}</p>
                      <p className="text-sm tabular-nums">{formatPrice(line.priceCents * line.quantity)}</p>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-ash">{line.artistName}</p>
                    {line.quantity > 1 ? (
                      <div className="mt-2 inline-flex items-center gap-3 text-xs text-ash">
                        <button
                          type="button"
                          onClick={() => setQuantity(line.productId, line.quantity - 1)}
                          className="hover:text-ink"
                        >
                          –
                        </button>
                        <span className="tabular-nums">{line.quantity}</span>
                        <button
                          type="button"
                          onClick={() => setQuantity(line.productId, line.quantity + 1)}
                          className="hover:text-ink"
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => removeItem(line.productId)}
                        className="link-underline mt-2 text-[10px] tracking-[0.14em] uppercase text-ash-2"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>

            <dl className="mt-7 space-y-2.5 border-t border-ink/10 pt-5 text-sm">
              <div className="flex justify-between text-ash">
                <dt>Subtotal</dt>
                <dd className="tabular-nums text-ink-2">{formatPrice(cart.subtotalCents)}</dd>
              </div>
              <div className="flex justify-between text-ash">
                <dt>
                  {SHIPPING_OPTIONS.find((option) => option.id === shippingMethod)?.label ?? "Freight"}
                </dt>
                <dd className="tabular-nums text-ink-2">
                  {shippingCents === 0 ? "Complimentary" : formatPrice(shippingCents)}
                </dd>
              </div>
              <div className="flex justify-between text-ash">
                <dt>Duties &amp; insurance</dt>
                <dd className="text-ink-2">Included</dd>
              </div>
              <div className="mt-3 flex items-baseline justify-between border-t border-ink/10 pt-4">
                <dt className="text-[11px] tracking-[0.16em] uppercase text-ash">Total</dt>
                <dd className="font-display text-3xl tabular-nums">{formatPrice(totalCents)}</dd>
              </div>
            </dl>

            {cart.subtotalCents < FREE_DOMESTIC_THRESHOLD && (
              <p className="mt-5 text-xs leading-relaxed text-ash">
                Domestic courier is complimentary above {formatPrice(FREE_DOMESTIC_THRESHOLD)}, and
                international freight above {formatPrice(FREE_INTERNATIONAL_THRESHOLD)}.
              </p>
            )}
          </div>

          <p className="mt-5 flex items-center gap-2 text-[11px] tracking-[0.14em] uppercase text-ash-2">
            <span className="text-ochre">✦</span> Seven-day viewing period on every work
          </p>
        </aside>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  error,
  placeholder,
  type = "text",
  hint,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  type?: string;
  hint?: string;
  autoComplete?: string;
}) {
  return (
    <label className="block">
      <span className="text-[11px] tracking-[0.16em] uppercase text-ash">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={`field ${error ? "border-clay" : ""}`}
      />
      {error ? (
        <span className="mt-1.5 block text-xs text-clay">{error}</span>
      ) : hint ? (
        <span className="mt-1.5 block text-xs text-ash-2">{hint}</span>
      ) : null}
    </label>
  );
}
