// File: app/api/main/authors/[slug]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { authors, articles, categories } from "@/db/schema";
import { eq, desc, and, sql, isNull } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const offset = (page - 1) * limit;

    // STEP 1: Get the Author Basic Info first
    const authorResult = await db
      .select()
      .from(authors)
      .where(eq(authors.slug, slug))
      .limit(1);

    if (!authorResult || authorResult.length === 0) {
      return NextResponse.json({ error: "Author not found" }, { status: 404 });
    }

    const authorData = authorResult[0];

    // STEP 2: Calculate Stats Live (Separate Aggregation Query)
    // This is bulletproof. It sums the columns directly from the articles table.
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

    // STEP 3: Get the Articles list
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
          eq(articles.primaryAuthorId, authorData.id),
          eq(articles.status, "published"),
          isNull(articles.deletedAt)
        )
      )
      .orderBy(desc(articles.publishedAt))
      .limit(limit)
      .offset(offset);

    // Prepare response
    const articleCount = Number(stats.liveArticleCount);

    return NextResponse.json({
      author: {
        ...authorData,
        // We overwrite the DB static count with the LIVE calculated count
        articleCount: articleCount,
        totalViews: Number(stats.totalViews),
        totalComments: Number(stats.totalComments),
        totalShares: Number(stats.totalShares),
      },
      articles: authorArticles,
      pagination: {
        page,
        limit,
        total: articleCount,
        totalPages: Math.ceil(articleCount / limit),
      },
    });
  } catch (error) {
    console.error("Author API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch author" },
      { status: 500 }
    );
  }
}