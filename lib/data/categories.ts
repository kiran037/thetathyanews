// File: lib/data/categories.ts
import { db } from "@/db";
import { categories, articles, authors } from "@/db/schema";
import { eq, desc, and, sql } from "drizzle-orm";

export interface CategoryData {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string | null;
  icon: string | null;
  coverImageUrl: string | null;
  displayOrder: number | null;
  articleCount: number;
  latestArticleDate: Date | null;
}

export async function getCategories(options: {
  sortBy?: "name" | "count" | "recent";
  limit?: number;
} = {}): Promise<{ categories: CategoryData[]; total: number }> {
  const sortBy = options.sortBy || "name";
  const limit = options.limit || 100;

  const categoriesList = await db
    .select({
      id: categories.id,
      name: categories.name,
      slug: categories.slug,
      description: categories.description,
      color: categories.color,
      icon: categories.icon,
      imageUrl: categories.imageUrl,
      displayOrder: categories.displayOrder,
      isVisible: categories.isVisible,
      articleCount: sql<number>`(
        SELECT COUNT(*)
        FROM ${articles}
        WHERE ${articles.categoryId} = ${categories.id}
          AND ${articles.status} = 'published'
          AND ${articles.deletedAt} IS NULL
      )`,
      latestArticleDate: sql<Date>`(
        SELECT MAX(${articles.publishedAt})
        FROM ${articles}
        WHERE ${articles.categoryId} = ${categories.id}
          AND ${articles.status} = 'published'
          AND ${articles.deletedAt} IS NULL
      )`,
    })
    .from(categories)
    .where(eq(categories.isVisible, true))
    .limit(limit);

  let sorted = categoriesList;
  if (sortBy === "count") {
    sorted = categoriesList.sort((a, b) => Number(b.articleCount) - Number(a.articleCount));
  } else if (sortBy === "recent") {
    sorted = categoriesList.sort((a, b) => {
      const dateA = a.latestArticleDate ? new Date(a.latestArticleDate).getTime() : 0;
      const dateB = b.latestArticleDate ? new Date(b.latestArticleDate).getTime() : 0;
      return dateB - dateA;
    });
  } else {
    sorted = categoriesList.sort((a, b) => {
      if (a.displayOrder !== b.displayOrder) {
        return (a.displayOrder || 0) - (b.displayOrder || 0);
      }
      return a.name.localeCompare(b.name);
    });
  }

  const mapped = sorted.map((cat) => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    description: cat.description,
    color: cat.color,
    icon: cat.icon,
    coverImageUrl: cat.imageUrl,
    displayOrder: cat.displayOrder,
    articleCount: Number(cat.articleCount),
    latestArticleDate: cat.latestArticleDate,
  }));

  return {
    categories: mapped,
    total: mapped.length,
  };
}

export async function getCategoryBySlug(slug: string) {
  const category = await db.query.categories.findFirst({
    where: and(
      eq(categories.slug, slug),
      eq(categories.isVisible, true)
    ),
  });

  return category || null;
}

export async function getCategoryWithArticles(
  slug: string,
  options: { page?: number; limit?: number } = {}
) {
  const page = options.page && options.page > 0 ? options.page : 1;
  const limit = options.limit && options.limit > 0 ? options.limit : 12;
  const offset = (page - 1) * limit;

  const category = await getCategoryBySlug(slug);
  if (!category) return null;

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(articles)
    .where(
      and(
        eq(articles.categoryId, category.id),
        eq(articles.status, "published"),
        sql`${articles.deletedAt} IS NULL`
      )
    );

  const rawArticles = await db
    .select({
      id: articles.id,
      slug: articles.slug,
      title: articles.title,
      excerpt: articles.excerpt,
      coverImageUrl: articles.coverImageUrl,
      coverImageAlt: articles.coverImageAlt,
      publishedAt: articles.publishedAt,
      viewCount: articles.viewCount,
      readCount: articles.readCount,
      commentCount: articles.commentCount,
      readingTimeMinutes: articles.readingTimeMinutes,
      isFeatured: articles.isFeatured,
      categoryId: categories.id,
      categoryName: categories.name,
      categorySlug: categories.slug,
      authorId: authors.id,
      authorName: authors.displayName,
      authorSlug: authors.slug,
      authorAvatar: authors.avatarUrl,
    })
    .from(articles)
    .leftJoin(categories, eq(articles.categoryId, categories.id))
    .leftJoin(authors, eq(articles.primaryAuthorId, authors.id))
    .where(
      and(
        eq(articles.categoryId, category.id),
        eq(articles.status, "published"),
        sql`${articles.deletedAt} IS NULL`
      )
    )
    .orderBy(desc(articles.publishedAt))
    .limit(limit)
    .offset(offset);

  const total = Number(count) || 0;

  return {
    category: {
      ...category,
      coverImageUrl: category.imageUrl,
      articleCount: total,
      latestArticleDate: null,
    },
    articles: rawArticles.map((row) => ({
      id: row.id,
      slug: row.slug,
      title: row.title,
      excerpt: row.excerpt,
      coverImageUrl: row.coverImageUrl,
      coverImageAlt: row.coverImageAlt,
      publishedAt: row.publishedAt,
      viewCount: row.viewCount,
      readCount: row.readCount,
      commentCount: row.commentCount,
      readingTimeMinutes: row.readingTimeMinutes,
      isFeatured: row.isFeatured,
      category: row.categoryId
        ? {
            id: row.categoryId,
            name: row.categoryName!,
            slug: row.categorySlug!,
          }
        : null,
      primaryAuthor: row.authorId
        ? {
            id: row.authorId,
            displayName: row.authorName!,
            slug: row.authorSlug!,
            avatarUrl: row.authorAvatar,
          }
        : null,
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}
