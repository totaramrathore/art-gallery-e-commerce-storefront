import { and, asc, desc, eq, gte, ilike, inArray, lte, ne, or, sql, type SQL } from "drizzle-orm";
import { db } from "@/db";
import {
  artists,
  collections,
  productImages,
  products,
  reviews,
  type Product,
  type Review,
} from "@/db/schema";

import { PRICE_BANDS, SORT_OPTIONS } from "@/lib/catalog";

export { PRICE_BANDS, SORT_OPTIONS };
export type { SortId } from "@/lib/catalog";

const cardColumns = {
  id: products.id,
  slug: products.slug,
  title: products.title,
  priceCents: products.priceCents,
  image: products.image,
  medium: products.medium,
  materials: products.materials,
  dimensions: products.dimensions,
  editionLabel: products.editionLabel,
  year: products.year,
  stock: products.stock,
  ratingTenths: products.ratingTenths,
  reviewCount: products.reviewCount,
  isFeatured: products.isFeatured,
  createdAt: products.createdAt,
  artistName: artists.name,
  artistSlug: artists.slug,
  artistLocation: artists.location,
  collectionName: collections.name,
  collectionSlug: collections.slug,
  collectionAccent: collections.accent,
};

export type ProductCard = {
  id: number;
  slug: string;
  title: string;
  priceCents: number;
  image: string;
  medium: string;
  materials: string;
  dimensions: string;
  editionLabel: string;
  year: number;
  stock: number;
  ratingTenths: number;
  reviewCount: number;
  isFeatured: boolean;
  createdAt: Date;
  artistName: string;
  artistSlug: string;
  artistLocation: string;
  collectionName: string;
  collectionSlug: string;
  collectionAccent: string;
};

function baseQuery() {
  return db
    .select(cardColumns)
    .from(products)
    .innerJoin(artists, eq(products.artistId, artists.id))
    .innerJoin(collections, eq(products.collectionId, collections.id));
}

export type ListParams = {
  collection?: string;
  artist?: string;
  medium?: string;
  price?: string;
  sort?: string;
  q?: string;
  inStockOnly?: boolean;
  limit?: number;
};

export async function listProducts(params: ListParams = {}): Promise<ProductCard[]> {
  const filters: SQL[] = [eq(products.isPublished, true)];

  if (params.collection) {
    filters.push(eq(collections.slug, params.collection));
  }
  if (params.artist) {
    filters.push(eq(artists.slug, params.artist));
  }
  if (params.medium) {
    filters.push(eq(products.medium, params.medium));
  }
  const band = PRICE_BANDS.find((b) => b.id === params.price);
  if (band) {
    filters.push(gte(products.priceCents, band.min));
    filters.push(lte(products.priceCents, band.max));
  }
  if (params.inStockOnly) {
    filters.push(gte(products.stock, 1));
  }
  if (params.q) {
    const needle = `%${params.q.trim()}%`;
    const search = or(
      ilike(products.title, needle),
      ilike(products.materials, needle),
      ilike(products.description, needle),
      ilike(artists.name, needle),
      ilike(collections.name, needle),
      ilike(products.medium, needle),
    );
    if (search) filters.push(search);
  }

  const order = (() => {
    switch (params.sort) {
      case "newest":
        return [desc(products.createdAt), desc(products.id)];
      case "price-asc":
        return [asc(products.priceCents)];
      case "price-desc":
        return [desc(products.priceCents)];
      case "rating":
        return [desc(products.ratingTenths), desc(products.reviewCount)];
      case "title":
        return [asc(products.title)];
      default:
        return [desc(products.isFeatured), desc(products.ratingTenths), desc(products.createdAt)];
    }
  })();

  const query = baseQuery()
    .where(and(...filters))
    .orderBy(...order);

  if (params.limit) {
    return query.limit(params.limit);
  }
  return query;
}

export async function getShopFacets() {
  const [collectionRows, mediumRows, artistRows, priceRow] = await Promise.all([
    db
      .select({
        slug: collections.slug,
        name: collections.name,
        count: sql<number>`count(${products.id})::int`,
      })
      .from(collections)
      .leftJoin(products, eq(products.collectionId, collections.id))
      .groupBy(collections.id, collections.slug, collections.name, collections.sortOrder)
      .orderBy(asc(collections.sortOrder)),
    db
      .select({
        medium: products.medium,
        count: sql<number>`count(*)::int`,
      })
      .from(products)
      .groupBy(products.medium)
      .orderBy(desc(sql`count(*)`)),
    db
      .select({
        slug: artists.slug,
        name: artists.name,
        location: artists.location,
        count: sql<number>`count(${products.id})::int`,
      })
      .from(artists)
      .leftJoin(products, eq(products.artistId, artists.id))
      .groupBy(artists.id, artists.slug, artists.name, artists.location)
      .orderBy(asc(artists.name)),
    db
      .select({
        min: sql<number>`coalesce(min(${products.priceCents}), 0)::int`,
        max: sql<number>`coalesce(max(${products.priceCents}), 0)::int`,
        total: sql<number>`count(*)::int`,
      })
      .from(products),
  ]);

  return {
    collections: collectionRows,
    mediums: mediumRows,
    artists: artistRows,
    price: priceRow[0] ?? { min: 0, max: 0, total: 0 },
  };
}

export async function getCollections() {
  return db
    .select({
      id: collections.id,
      slug: collections.slug,
      name: collections.name,
      tagline: collections.tagline,
      description: collections.description,
      image: collections.image,
      accent: collections.accent,
      sortOrder: collections.sortOrder,
      isFeatured: collections.isFeatured,
      count: sql<number>`count(${products.id})::int`,
    })
    .from(collections)
    .leftJoin(products, eq(products.collectionId, collections.id))
    .groupBy(collections.id)
    .orderBy(asc(collections.sortOrder));
}

export async function getCollectionBySlug(slug: string) {
  const rows = await db
    .select({
      id: collections.id,
      slug: collections.slug,
      name: collections.name,
      tagline: collections.tagline,
      description: collections.description,
      image: collections.image,
      accent: collections.accent,
      count: sql<number>`count(${products.id})::int`,
    })
    .from(collections)
    .leftJoin(products, eq(products.collectionId, collections.id))
    .where(eq(collections.slug, slug))
    .groupBy(collections.id);
  return rows[0] ?? null;
}

export async function getFeaturedProducts(limit = 6): Promise<ProductCard[]> {
  return baseQuery()
    .where(and(eq(products.isPublished, true), eq(products.isFeatured, true)))
    .orderBy(desc(products.ratingTenths), desc(products.createdAt))
    .limit(limit);
}

export async function getNewArrivals(limit = 4): Promise<ProductCard[]> {
  return baseQuery()
    .where(eq(products.isPublished, true))
    .orderBy(desc(products.createdAt))
    .limit(limit);
}

export async function getArtists() {
  return db
    .select({
      id: artists.id,
      slug: artists.slug,
      name: artists.name,
      location: artists.location,
      bio: artists.bio,
      image: artists.image,
      count: sql<number>`count(${products.id})::int`,
    })
    .from(artists)
    .leftJoin(products, eq(products.artistId, artists.id))
    .groupBy(artists.id)
    .orderBy(asc(artists.id));
}

export async function getArtistBySlug(slug: string) {
  const rows = await db
    .select({
      id: artists.id,
      slug: artists.slug,
      name: artists.name,
      location: artists.location,
      bio: artists.bio,
      image: artists.image,
    })
    .from(artists)
    .where(eq(artists.slug, slug));
  return rows[0] ?? null;
}

export type ProductDetail = {
  product: ProductCard & { story: string; description: string; collectionDescription: string };
  images: { id: number; url: string; alt: string; caption: string }[];
  reviews: Review[];
  ratingBreakdown: { stars: number; count: number }[];
};

export async function getProductBySlug(slug: string): Promise<ProductDetail | null> {
  const rows = await db
    .select({
      ...cardColumns,
      story: products.story,
      description: products.description,
      collectionDescription: collections.description,
    })
    .from(products)
    .innerJoin(artists, eq(products.artistId, artists.id))
    .innerJoin(collections, eq(products.collectionId, collections.id))
    .where(eq(products.slug, slug));

  const product = rows[0];
  if (!product) return null;

  const [images, reviewRows] = await Promise.all([
    db
      .select({
        id: productImages.id,
        url: productImages.url,
        alt: productImages.alt,
        caption: productImages.caption,
      })
      .from(productImages)
      .where(eq(productImages.productId, product.id))
      .orderBy(asc(productImages.position)),
    db
      .select()
      .from(reviews)
      .where(eq(reviews.productId, product.id))
      .orderBy(desc(reviews.createdAt)),
  ]);

  const fallbackImages = images.length
    ? images
    : [
        {
          id: -1,
          url: product.image,
          alt: product.title,
          caption: "Full work",
        },
      ];

  const breakdown = [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: reviewRows.filter((r) => r.rating === stars).length,
  }));

  return {
    product: { ...product, story: product.story },
    images: fallbackImages,
    reviews: reviewRows,
    ratingBreakdown: breakdown,
  };
}

export async function getRelatedProducts(product: ProductCard, limit = 4): Promise<ProductCard[]> {
  return baseQuery()
    .where(and(eq(products.isPublished, true), ne(products.id, product.id)))
    .orderBy(
      sql`case when ${collections.slug} = ${product.collectionSlug} then 0 else 1 end`,
      desc(products.ratingTenths),
      desc(products.createdAt),
    )
    .limit(limit);
}

export async function getProductsByIds(ids: number[]): Promise<ProductCard[]> {
  if (!ids.length) return [];
  return baseQuery().where(inArray(products.id, ids));
}

export async function getGalleryStats() {
  const rows = await db
    .select({
      works: sql<number>`count(*)::int`,
      artists: sql<number>`count(distinct ${products.artistId})::int`,
      countries: sql<number>`count(distinct ${artists.location})::int`,
      reviewCount: sql<number>`coalesce(sum(${products.reviewCount}), 0)::int`,
    })
    .from(products)
    .innerJoin(artists, eq(products.artistId, artists.id));
  return rows[0] ?? { works: 0, artists: 0, countries: 0, reviewCount: 0 };
}

export type { Product, Review };
