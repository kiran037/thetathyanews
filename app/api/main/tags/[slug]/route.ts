// File: app/api/main/tags/[slug]/route.ts
// API endpoint for getting a single tag with its articles

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/index";
import { tags, articles, articleTags, categories, authors } from "@/db/schema";
import { eq, desc, and, sql } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ slug: string }> } // FIX 1: Type params as a Promise
) {
  try {
    const params = await props.params; // FIX 1: Await params
    const { slug } = params;
    
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const offset = (page - 1) * limit;

    // Get tag
    const tag = await db.query.tags.findFirst({
      where: and(
        eq(tags.slug, slug),
        eq(tags.isVisible, true) // FIX 2: isActive -> isVisible based on schema
      ),
    });

    if (!tag) {
      return NextResponse.json(
        { error: "Tag not found" },
        { status: 404 }
      );
    }

    // Get total article count
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

    // Get articles for this tag
    const tagArticles = await db
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

    return NextResponse.json({
      tag,
      articles: tagArticles,
      pagination: {
        page,
        limit,
        total: Number(count),
        totalPages: Math.ceil(Number(count) / limit),
      },
    });
  } catch (error) {
    console.error("Tag API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch tag" },
      { status: 500 }
    );
  }
}