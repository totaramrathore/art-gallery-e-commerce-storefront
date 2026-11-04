"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Stars } from "@/components/ui/stars";
import { relativeTime } from "@/lib/format";

export type ReviewItem = {
  id: number;
  authorName: string;
  authorLocation: string;
  rating: number;
  title: string;
  body: string;
  verifiedPurchase: boolean;
  createdAt: string;
};

export function ReviewsSection({
  slug,
  reviews: initialReviews,
  breakdown,
  ratingTenths,
  reviewCount,
}: {
  slug: string;
  reviews: ReviewItem[];
  breakdown: { stars: number; count: number }[];
  ratingTenths: number;
  reviewCount: number;
}) {
  const router = useRouter();
  const [reviews, setReviews] = useState(initialReviews);
  const [formOpen, setFormOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [authorName, setAuthorName] = useState("");
  const [authorLocation, setAuthorLocation] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [thanks, setThanks] = useState(false);

  const total = reviews.length || reviewCount;
  const average = total
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / total
    : ratingTenths / 10;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, authorName, authorLocation, rating, title, body }),
      });
      const data = (await response.json()) as {
        ok: boolean;
        error?: string;
        review?: ReviewItem & { createdAt: string };
      };

      if (!data.ok || !data.review) {
        setError(data.error ?? "Could not post your review.");
        return;
      }

      setReviews((current) => [
        { ...data.review!, createdAt: new Date().toISOString() },
        ...current,
      ]);
      setThanks(true);
      setFormOpen(false);
      setAuthorName("");
      setAuthorLocation("");
      setTitle("");
      setBody("");
      router.refresh();
    } catch {
      setError("Network hiccup — please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="border-t border-ink/10 pt-14" id="reviews">
      <div className="grid gap-12 lg:grid-cols-[20rem_1fr]">
        <div>
          <p className="eyebrow text-ash">Collector notes</p>
          <h2 className="mt-3 font-display text-3xl">Reviews</h2>

          <div className="mt-6 flex items-end gap-4">
            <p className="font-display text-6xl leading-none tabular-nums">{average.toFixed(1)}</p>
            <div className="pb-1">
              <Stars rating={average} size="md" />
              <p className="mt-1 text-xs text-ash">{total} reviews</p>
            </div>
          </div>

          <div className="mt-6 space-y-2">
            {breakdown.map((row) => {
              const width = total ? (row.count / total) * 100 : 0;
              return (
                <div key={row.stars} className="flex items-center gap-3">
                  <span className="w-8 text-[11px] tabular-nums text-ash">{row.stars}★</span>
                  <span className="h-[3px] flex-1 bg-ink/10">
                    <span
                      className="block h-full bg-ochre transition-[width] duration-700"
                      style={{ width: `${width}%` }}
                    />
                  </span>
                  <span className="w-6 text-right text-[11px] tabular-nums text-ash-2">{row.count}</span>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => setFormOpen((open) => !open)}
            className="btn-outline mt-8 w-full"
          >
            {formOpen ? "Close" : "Write a review"}
          </button>

          {thanks && (
            <p className="mt-4 border border-ochre/30 bg-ochre/8 px-4 py-3 text-sm text-ochre-deep">
              Thank you — your note is live.
            </p>
          )}
        </div>

        <div>
          {formOpen && (
            <form onSubmit={submit} className="mb-12 border border-ink/12 bg-bone-2/50 p-6">
              <p className="eyebrow text-ash">Tell us what you think</p>

              <div className="mt-5 flex items-center gap-1" onMouseLeave={() => setHoverRating(0)}>
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRating(value)}
                    onMouseEnter={() => setHoverRating(value)}
                    aria-label={`${value} star${value === 1 ? "" : "s"}`}
                    className={`text-2xl leading-none transition ${
                      (hoverRating || rating) >= value ? "text-ochre" : "text-ink/20"
                    }`}
                  >
                    ★
                  </button>
                ))}
                <span className="ml-3 text-xs text-ash">{rating} of 5</span>
              </div>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <label className="block">
                  <span className="text-[11px] tracking-[0.16em] uppercase text-ash">Name</span>
                  <input
                    required
                    value={authorName}
                    onChange={(event) => setAuthorName(event.target.value)}
                    className="field"
                    placeholder="Nomsa V."
                  />
                </label>
                <label className="block">
                  <span className="text-[11px] tracking-[0.16em] uppercase text-ash">City / country</span>
                  <input
                    value={authorLocation}
                    onChange={(event) => setAuthorLocation(event.target.value)}
                    className="field"
                    placeholder="Cape Town, South Africa"
                  />
                </label>
              </div>

              <label className="mt-5 block">
                <span className="text-[11px] tracking-[0.16em] uppercase text-ash">Headline</span>
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  className="field"
                  placeholder="It changed the whole room"
                />
              </label>

              <label className="mt-5 block">
                <span className="text-[11px] tracking-[0.16em] uppercase text-ash">Your note</span>
                <textarea
                  required
                  minLength={12}
                  rows={4}
                  value={body}
                  onChange={(event) => setBody(event.target.value)}
                  className="field resize-none"
                  placeholder="How does it live in your space?"
                />
              </label>

              {error && <p className="mt-4 text-sm text-clay">{error}</p>}

              <button type="submit" disabled={submitting} className="btn-ink mt-6">
                {submitting ? "Posting…" : "Post review"}
              </button>
            </form>
          )}

          {reviews.length === 0 ? (
            <p className="text-sm text-ash">
              No reviews yet. If you have collected this work, we would love to hear how it lives in your
              space.
            </p>
          ) : (
            <ul className="divide-y divide-ink/10">
              {reviews.map((review) => (
                <li key={review.id} className="py-7 first:pt-0">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-display text-lg">{review.title || "Collector note"}</p>
                      <p className="mt-1 text-xs text-ash">
                        {review.authorName}
                        {review.authorLocation ? ` · ${review.authorLocation}` : ""} ·{" "}
                        {relativeTime(review.createdAt)}
                        {review.verifiedPurchase && (
                          <span className="ml-2 border border-ochre/40 px-1.5 py-0.5 text-[10px] tracking-[0.14em] uppercase text-ochre">
                            Verified
                          </span>
                        )}
                      </p>
                    </div>
                    <Stars rating={review.rating} />
                  </div>
                  <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-2">{review.body}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
