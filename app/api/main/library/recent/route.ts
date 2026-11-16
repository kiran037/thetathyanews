// File: app/api/main/library/recent/route.ts
// API endpoint for recently viewed articles

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/db/index";
import { readingHistory, articles, categories, authors } from "@/db/schema";
import { eq, desc, and, sql } from "drizzle-orm";
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
    const days = parseInt(searchParams.get("days") || "30");
    const offset = (page - 1) * limit;

    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - days);

    const conditions = [
      eq(readingHistory.userId, session.userId),
      sql`${readingHistory.lastReadAt} >= ${dateThreshold}`,
    ];

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(readingHistory)
      .where(and(...conditions));

    const recentArticles = await db
      .select({
        id: readingHistory.id,
        readPercentage: readingHistory.readPercentage,
        timeSpentSeconds: readingHistory.timeSpentSeconds,
        lastReadAt: readingHistory.lastReadAt,
        firstReadAt: readingHistory.firstReadAt,
        isCompleted: readingHistory.isCompleted,
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

    const dailyStats = await db
      .select({
        date: sql<string>`DATE(${readingHistory.lastReadAt})`,
        count: sql<number>`count(DISTINCT ${readingHistory.articleId})`,
        totalTimeSpent: sql<number>`COALESCE(SUM(${readingHistory.timeSpentSeconds}), 0)`,
      })
      .from(readingHistory)
      .where(
        and(
          eq(readingHistory.userId, session.userId),
          sql`${readingHistory.lastReadAt} >= NOW() - INTERVAL '7 days'`
        )
      )
      .groupBy(sql`DATE(${readingHistory.lastReadAt})`)
      .orderBy(desc(sql`DATE(${readingHistory.lastReadAt})`));

    return NextResponse.json({
      articles: recentArticles,
      dailyStats: dailyStats.map((stat) => ({
        date: stat.date,
        count: Number(stat.count),
        totalTimeSpent: Number(stat.totalTimeSpent),
      })),
      pagination: {
        page,
        limit,
        total: Number(count),
        totalPages: Math.ceil(Number(count) / limit),
      },
    });
  } catch (error) {
    console.error("Recent articles API error:", error);
    return NextResponse.json({ error: "Failed to fetch recent articles" }, { status: 500 });
  }
}