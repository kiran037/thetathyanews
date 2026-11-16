// File: app/api/main/library/continue/route.ts
// API endpoint for articles user can continue reading

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/db/index";
import { readingHistory, articles, categories, authors } from "@/db/schema";
import { eq, desc, and, sql, gte, lt } from "drizzle-orm";
import { getSessionByToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("session_token")?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const session = await getSessionByToken(sessionToken);
    if (!session) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;

    const conditions = [
      eq(readingHistory.userId, session.userId),
      eq(readingHistory.isCompleted, false),
      gte(readingHistory.readPercentage, 10),
      lt(readingHistory.readPercentage, 90),
    ];

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(readingHistory)
      .where(and(...conditions));

    const continueReading = await db
      .select({
        id: readingHistory.id,
        readPercentage: readingHistory.readPercentage,
        timeSpentSeconds: readingHistory.timeSpentSeconds,
        scrollDepth: readingHistory.scrollDepth,
        lastReadAt: readingHistory.lastReadAt,
        article: {
          id: articles.id,
          slug: articles.slug,
          title: articles.title,
          excerpt: articles.excerpt,
          coverImageUrl: articles.coverImageUrl,
          publishedAt: articles.publishedAt,
          readingTimeMinutes: articles.readingTimeMinutes,
          viewCount: articles.viewCount,
          commentCount: articles.commentCount,
        },
        category: {
          id: categories.id,
          name: categories.name,
          slug: categories.slug,
        },
        author: {
          id: authors.id,
          displayName: authors.displayName,
          slug: authors.slug,
          avatarUrl: authors.avatarUrl,
        },
      })
      .from(readingHistory)
      .innerJoin(articles, eq(readingHistory.articleId, articles.id))
      .leftJoin(categories, eq(articles.categoryId, categories.id))
      .leftJoin(authors, eq(articles.primaryAuthorId, authors.id))
      .where(and(...conditions))
      .orderBy(desc(readingHistory.lastReadAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({
      articles: continueReading,
      pagination: {
        page,
        limit,
        total: Number(count),
        totalPages: Math.ceil(Number(count) / limit),
      },
    });
  } catch (error) {
    console.error("Continue reading API error:", error);
    return NextResponse.json({ error: "Failed to fetch continue reading" }, { status: 500 });
  }
}