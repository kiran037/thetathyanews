// File: lib/data/articles.ts
import { db } from "@/db";
import { articles, categories, authors, articleStatusEnum } from "@/db/schema";
import { eq, desc, and, sql, SQL, gte } from "drizzle-orm";

export interface ArticleQueryOptions {
  page?: number;
  limit?: number;
  category?: string; // category slug
  status?: typeof articleStatusEnum.enumValues[number];
  featured?: boolean;
  authorId?: string;
  sortBy?: "recent" | "views" | "popular";
}

export interface FormattedArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  coverImageUrl: string | null;
  coverImageAlt: string | null;
  publishedAt: Date | null;
  viewCount: number | null;
  readCount: number | null;
  commentCount: number | null;
  readingTimeMinutes: number | null;
  isFeatured: boolean | null;
  category: {
    id: string;
    name: string;
    slug: string;
  } | null;
  primaryAuthor: {
    id: string;
    displayName: string;
    slug: string;
    avatarUrl: string | null;
  } | null;
}

export interface ArticlesResult {
  articles: FormattedArticle[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export async function getArticles(options: ArticleQueryOptions = {}): Promise<ArticlesResult> {
  const page = options.page && options.page > 0 ? options.page : 1;
  const limit = options.limit && options.limit > 0 ? options.limit : 12;
  const offset = (page - 1) * limit;
  const status = options.status || "published";

  const conditions: SQL[] = [
    eq(articles.status, status),
    sql`${articles.deletedAt} IS NULL`,
  ];

  if (options.category) {
    const cat = await db.query.categories.findFirst({
      columns: { id: true },
      where: eq(categories.slug, options.category),
    });

    if (cat) {
      conditions.push(eq(articles.categoryId, cat.id));
    } else {
      return {
        articles: [],
        pagination: { page, limit, total: 0, totalPages: 0 },
      };
    }
  }

  if (options.featured) {
    conditions.push(eq(articles.isFeatured, true));
  }

  if (options.authorId) {
    conditions.push(eq(articles.primaryAuthorId, options.authorId));
  }

  // Count total matching articles
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(articles)
    .where(and(...conditions));

  const total = Number(count) || 0;

  // Query articles with joins
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
    .where(and(...conditions))
    .orderBy(desc(articles.publishedAt))
    .limit(limit)
    .offset(offset);

  const formattedArticles: FormattedArticle[] = rawArticles.map((row) => ({
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
  }));

  return {
    articles: formattedArticles,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getArticleBySlug(slug: string, options: { incrementView?: boolean } = {}) {
  const article = await db.query.articles.findFirst({
    where: and(
      eq(articles.slug, slug),
      eq(articles.status, "published"),
      sql`${articles.deletedAt} IS NULL`
    ),
    with: {
      category: true,
      primaryAuthor: true,
      authors: {
        with: {
          author: true,
        },
        orderBy: (articleAuthors, { asc }) => [asc(articleAuthors.displayOrder)],
      },
      tags: {
        with: {
          tag: true,
        },
      },
    },
  });

  if (!article) return null;

  if (options.incrementView) {
    await db
      .update(articles)
      .set({
        viewCount: sql`${articles.viewCount} + 1`,
      })
      .where(eq(articles.id, article.id));
  }

  return {
    ...article,
    tags: article.tags.map((t) => t.tag),
    authors: article.authors.map((a) => ({
      ...a.author,
      contributionType: a.contributionType,
    })),
  };
}

export async function getRelatedArticles(categoryId: string, excludeArticleId: string, limit = 3) {
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
        eq(articles.categoryId, categoryId),
        eq(articles.status, "published"),
        sql`${articles.deletedAt} IS NULL`,
        sql`${articles.id} != ${excludeArticleId}`
      )
    )
    .orderBy(desc(articles.publishedAt))
    .limit(limit);

  return rawArticles.map((row) => ({
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
  }));
}

export async function getTrendingArticles(options: { limit?: number; days?: number } = {}) {
  const limit = options.limit || 10;
  const days = options.days || 7;

  const dateThreshold = new Date();
  dateThreshold.setDate(dateThreshold.getDate() - days);

  const rawArticles = await db
    .select({
      id: articles.id,
      slug: articles.slug,
      title: articles.title,
      excerpt: articles.excerpt,
      coverImageUrl: articles.coverImageUrl,
      publishedAt: articles.publishedAt,
      viewCount: articles.viewCount,
      readCount: articles.readCount,
      commentCount: articles.commentCount,
      shareCount: articles.shareCount,
      readingTimeMinutes: articles.readingTimeMinutes,
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
        eq(articles.status, "published"),
        gte(articles.publishedAt, dateThreshold),
        sql`${articles.deletedAt} IS NULL`
      )
    )
    .orderBy(
      desc(
        sql`${articles.viewCount} + ${articles.readCount} * 2 + ${articles.shareCount} * 3 + ${articles.commentCount} * 4`
      )
    )
    .limit(limit);

  return rawArticles.map((row) => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    coverImageUrl: row.coverImageUrl,
    publishedAt: row.publishedAt,
    viewCount: row.viewCount,
    readCount: row.readCount,
    commentCount: row.commentCount,
    shareCount: row.shareCount,
    readingTimeMinutes: row.readingTimeMinutes,
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
  }));
}

export async function getRecommendedArticles(_userId?: string, limit = 15) {
  // Use trending articles for recommendation fallback
  return await getTrendingArticles({ limit });
}
