// File: lib/data/tags.ts
import { db } from "@/db";
import { tags, articles, articleTags, categories, authors } from "@/db/schema";
import { eq, desc, and, sql } from "drizzle-orm";

export interface TagData {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string | null;
  articleCount: number;
  latestArticleDate: Date | null;
}

export async function getTags(options: {
  sortBy?: "count" | "recent" | "name";
  limit?: number;
  minCount?: number;
} = {}): Promise<{ tags: TagData[]; total: number }> {
  const sortBy = options.sortBy || "count";
  const limit = options.limit || 100;
  const minCount = options.minCount || 1;

  const tagsList = await db
    .select({
      id: tags.id,
      name: tags.name,
      slug: tags.slug,
      description: tags.description,
      isVisible: tags.isVisible,
      articleCount: sql<number>`(
        SELECT COUNT(DISTINCT at.article_id)
        FROM article_tags at
        INNER JOIN articles a ON a.id = at.article_id
        WHERE at.tag_id = "tags"."id"
          AND a.status = 'published'
          AND a.deleted_at IS NULL
      )`,
      latestArticleDate: sql<Date>`(
        SELECT MAX(a.published_at)
        FROM article_tags at
        INNER JOIN articles a ON a.id = at.article_id
        WHERE at.tag_id = "tags"."id"
          AND a.status = 'published'
          AND a.deleted_at IS NULL
      )`,
    })
    .from(tags)
    .where(eq(tags.isVisible, true))
    .limit(limit);

  const filtered = tagsList.filter((t) => Number(t.articleCount) >= minCount);

  let sorted = filtered;
  if (sortBy === "count") {
    sorted = filtered.sort((a, b) => Number(b.articleCount) - Number(a.articleCount));
  } else if (sortBy === "recent") {
    sorted = filtered.sort((a, b) => {
      const dateA = a.latestArticleDate ? new Date(a.latestArticleDate).getTime() : 0;
      const dateB = b.latestArticleDate ? new Date(b.latestArticleDate).getTime() : 0;
      return dateB - dateA;
    });
  } else {
    sorted = filtered.sort((a, b) => a.name.localeCompare(b.name));
  }

  const mapped: TagData[] = sorted.map((tag) => ({
    id: tag.id,
    name: tag.name,
    slug: tag.slug,
    description: tag.description,
    color: null,
    articleCount: Number(tag.articleCount),
    latestArticleDate: tag.latestArticleDate,
  }));

  return {
    tags: mapped,
    total: mapped.length,
  };
}

export async function getTagBySlug(slug: string) {
  const tag = await db.query.tags.findFirst({
    where: and(
      eq(tags.slug, slug),
      eq(tags.isVisible, true)
    ),
  });

  return tag || null;
}

export async function getTagWithArticles(
  slug: string,
  options: { page?: number; limit?: number } = {}
) {
  const page = options.page && options.page > 0 ? options.page : 1;
  const limit = options.limit && options.limit > 0 ? options.limit : 12;
  const offset = (page - 1) * limit;

  const tag = await getTagBySlug(slug);
  if (!tag) return null;

  const [{ count }] = await db
    .select({ count: sql<number>`count(DISTINCT ${articleTags.articleId})` })
    .from(articleTags)
    .innerJoin(articles, eq(articles.id, articleTags.articleId))
    .where(
      and(
        eq(articleTags.tagId, tag.id),
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
    .from(articleTags)
    .innerJoin(articles, eq(articles.id, articleTags.articleId))
    .leftJoin(categories, eq(articles.categoryId, categories.id))
    .leftJoin(authors, eq(articles.primaryAuthorId, authors.id))
    .where(
      and(
        eq(articleTags.tagId, tag.id),
        eq(articles.status, "published"),
        sql`${articles.deletedAt} IS NULL`
      )
    )
    .orderBy(desc(articles.publishedAt))
    .limit(limit)
    .offset(offset);

  const total = Number(count) || 0;

  return {
    tag: {
      ...tag,
      color: null,
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
