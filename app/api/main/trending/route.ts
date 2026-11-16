// File: app/api/main/trending/route.ts
// API endpoint for getting trending articles

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { articles, categories, authors, articleAuthors } from "@/db/schema";
import { eq, desc, and, sql, gte } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "10");
    const days = parseInt(searchParams.get("days") || "7");

    // Get trending articles from last X days
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - days);

    const trendingArticles = await db
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
          eq(articles.status, "published"),
          gte(articles.publishedAt, dateThreshold),
          sql`${articles.deletedAt} IS NULL`
        )
      )
      .orderBy(
        desc(sql`${articles.viewCount} + ${articles.readCount} * 2 + ${articles.shareCount} * 3 + ${articles.commentCount} * 4`)
      )
      .limit(limit);

    return NextResponse.json({ articles: trendingArticles });
  } catch (error) {
    console.error("Trending API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch trending articles" },
      { status: 500 }
    );
  }
}