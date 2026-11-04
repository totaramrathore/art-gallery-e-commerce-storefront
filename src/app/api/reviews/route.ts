import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { products, reviews } from "@/db/schema";

export const dynamic = "force-dynamic";

type ReviewBody = {
  slug?: string;
  authorName?: string;
  authorLocation?: string;
  rating?: number;
  title?: string;
  body?: string;
};

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as ReviewBody;

    const slug = (payload.slug ?? "").trim();
    const authorName = (payload.authorName ?? "").trim();
    const authorLocation = (payload.authorLocation ?? "").trim();
    const title = (payload.title ?? "").trim();
    const text = (payload.body ?? "").trim();
    const rating = Math.round(Number(payload.rating));

    if (!slug) {
      return Response.json({ ok: false, error: "Missing artwork." }, { status: 400 });
    }
    if (authorName.length < 2) {
      return Response.json({ ok: false, error: "Please add your name." }, { status: 400 });
    }
    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      return Response.json({ ok: false, error: "Please choose a rating between 1 and 5." }, { status: 400 });
    }
    if (text.length < 12) {
      return Response.json({ ok: false, error: "Please write at least a sentence." }, { status: 400 });
    }

    const found = await db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.slug, slug))
      .limit(1);

    if (!found.length) {
      return Response.json({ ok: false, error: "We could not find that artwork." }, { status: 404 });
    }

    const productId = found[0].id;

    const [review] = await db
      .insert(reviews)
      .values({
        productId,
        authorName,
        authorLocation,
        rating,
        title,
        body: text,
        verifiedPurchase: true,
      })
      .returning();

    const [aggregate] = await db
      .select({
        average: sql<number>`coalesce(avg(${reviews.rating}), 0)::float`,
        total: sql<number>`count(*)::int`,
      })
      .from(reviews)
      .where(eq(reviews.productId, productId));

    const ratingTenths = Math.round((aggregate?.average ?? 0) * 10);

    await db
      .update(products)
      .set({ ratingTenths, reviewCount: aggregate?.total ?? 0 })
      .where(eq(products.id, productId));

    return Response.json({
      ok: true,
      review,
      ratingTenths,
      reviewCount: aggregate?.total ?? 0,
    });
  } catch (error) {
    console.error("review POST failed", error);
    return Response.json({ ok: false, error: "Could not post your review." }, { status: 500 });
  }
}
