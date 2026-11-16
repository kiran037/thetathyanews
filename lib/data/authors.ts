// File: lib/data/authors.ts
import { db } from "@/db";
import { authors, articles, categories } from "@/db/schema";
import { eq, desc, asc, and, sql, isNull } from "drizzle-orm";

export interface AuthorData {
  id: string;
  slug: string;
  displayName: string;
  bio: string | null;
  avatarUrl: string | null;
  title: string | null;
  website: string | null;
  twitter: string | null;
  linkedin: string | null;
  isVerified: boolean | null;
  isStaff: boolean | null;
  articleCount: number;
  createdAt: Date | null;
  latestArticleDate: Date | null;
  totalViews: number;
  totalComments?: number;
  totalShares?: number;
}

export async function getAuthors(options: {
  sortBy?: "articles" | "name" | "recent" | "views";
  limit?: number;
  staffOnly?: boolean;
  verifiedOnly?: boolean;
} = {}): Promise<{ authors: AuthorData[]; total: number }> {
  const sortBy = options.sortBy || "articles";
  const limit = options.limit || 100;
  const staffOnly = options.staffOnly === true;
  const verifiedOnly = options.verifiedOnly === true;

  const conditions = [];
  if (staffOnly) {
    conditions.push(eq(authors.isStaff, true));
  }
  if (verifiedOnly) {
    conditions.push(eq(authors.isVerified, true));
  }

  const latestArticleDateSq = sql<Date>`(
    SELECT MAX(${articles.publishedAt})
    FROM ${articles}
    WHERE ${articles.primaryAuthorId} = ${authors.id}
      AND ${articles.status} = 'published'
      AND ${articles.deletedAt} IS NULL
  )`;

  const totalViewsSq = sql<number>`(
    SELECT COALESCE(SUM(${articles.viewCount}), 0)
    FROM ${articles}
    WHERE ${articles.primaryAuthorId} = ${authors.id}
      AND ${articles.status} = 'published'
      AND ${articles.deletedAt} IS NULL
  )`;

  let orderByClause;
  switch (sortBy) {
    case "views":
      orderByClause = desc(totalViewsSq);
      break;
    case "recent":
      orderByClause = desc(latestArticleDateSq);
      break;
    case "name":
      orderByClause = asc(authors.displayName);
      break;
    case "articles":
    default:
      orderByClause = desc(authors.articleCount);
      break;
  }

  const authorsList = await db
    .select({
      id: authors.id,
      slug: authors.slug,
      displayName: authors.displayName,
      bio: authors.bio,
      avatarUrl: authors.avatarUrl,
      title: authors.title,
      website: authors.website,
      twitter: authors.twitter,
      linkedin: authors.linkedin,
      isVerified: authors.isVerified,
      isStaff: authors.isStaff,
      articleCount: authors.articleCount,
      createdAt: authors.createdAt,
      latestArticleDate: latestArticleDateSq,
      totalViews: totalViewsSq,
    })
    .from(authors)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(orderByClause)
    .limit(limit);

  const mapped: AuthorData[] = authorsList.map((a) => ({
    ...a,
    articleCount: Number(a.articleCount || 0),
    totalViews: Number(a.totalViews || 0),
  }));

  return {
    authors: mapped,
    total: mapped.length,
  };
}

export async function getAuthorBySlug(slug: string) {
  const authorResult = await db
    .select()
    .from(authors)
    .where(eq(authors.slug, slug))
    .limit(1);

  if (!authorResult || authorResult.length === 0) {
    return null;
  }

  const authorData = authorResult[0];

  const statsResult = await db
    .select({
      liveArticleCount: sql<number>`COUNT(*)`,
      totalViews: sql<number>`COALESCE(SUM(${articles.viewCount}), 0)`,
      totalComments: sql<number>`COALESCE(SUM(${articles.commentCount}), 0)`,
      totalShares: sql<number>`COALESCE(SUM(${articles.shareCount}), 0)`,
    })
    .from(articles)
    .where(
      and(
        eq(articles.primaryAuthorId, authorData.id),
        eq(articles.status, "published"),
        isNull(articles.deletedAt)
      )
    );

  const stats = statsResult[0];

  return {
    ...authorData,
    articleCount: Number(stats.liveArticleCount || 0),
    totalViews: Number(stats.totalViews || 0),
    totalComments: Number(stats.totalComments || 0),
    totalShares: Number(stats.totalShares || 0),
  };
}

export async function getAuthorWithArticles(
  slug: string,
  options: { page?: number; limit?: number } = {}
) {
  const page = options.page && options.page > 0 ? options.page : 1;
  const limit = options.limit && options.limit > 0 ? options.limit : 12;
  const offset = (page - 1) * limit;

  const author = await getAuthorBySlug(slug);
  if (!author) return null;

  const authorArticles = await db
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
      category: {
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
      },
      primaryAuthor: {
        id: authors.id,
        displayName: authors.displayName,
        slug: authors.slug,
        avatarUrl: authors.avatarUrl,
      },
    })
    .from(articles)
    .leftJoin(categories, eq(articles.categoryId, categories.id))
    .leftJoin(authors, eq(articles.primaryAuthorId, authors.id))
    .where(
      and(
        eq(articles.primaryAuthorId, author.id),
        eq(articles.status, "published"),
        isNull(articles.deletedAt)
      )
    )
    .orderBy(desc(articles.publishedAt))
    .limit(limit)
    .offset(offset);

  const articleCount = author.articleCount;

  return {
    author,
    articles: authorArticles,
    pagination: {
      page,
      limit,
      total: articleCount,
      totalPages: Math.ceil(articleCount / limit),
    },
  };
}
