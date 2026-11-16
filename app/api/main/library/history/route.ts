// File: app/api/main/library/history/route.ts
// API endpoint for user's reading history

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
    const filter = searchParams.get("filter");
    const offset = (page - 1) * limit;

    const conditions = [eq(readingHistory.userId, session.userId)];
    if (filter === "completed") conditions.push(eq(readingHistory.isCompleted, true));
    else if (filter === "in_progress") conditions.push(eq(readingHistory.isCompleted, false));

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(readingHistory)
      .where(and(...conditions));

    const history = await db
      .select({
        id: readingHistory.id,
        readPercentage: readingHistory.readPercentage,
        timeSpentSeconds: readingHistory.timeSpentSeconds,
        scrollDepth: readingHistory.scrollDepth,
        isCompleted: readingHistory.isCompleted,
        lastReadAt: readingHistory.lastReadAt,
        firstReadAt: readingHistory.firstReadAt,
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

    const [stats] = await db
      .select({
        totalArticles: sql<number>`count(*)`,
        completedArticles: sql<number>`count(*) FILTER (WHERE ${readingHistory.isCompleted} = true)`,
        totalTimeSpent: sql<number>`COALESCE(SUM(${readingHistory.timeSpentSeconds}), 0)`,
        averageCompletion: sql<number>`COALESCE(AVG(${readingHistory.readPercentage}), 0)`,
      })
      .from(readingHistory)
      .where(eq(readingHistory.userId, session.userId));

    return NextResponse.json({
      history,
      stats: {
        ...stats,
        totalArticles: Number(stats.totalArticles),
        completedArticles: Number(stats.completedArticles),
        totalTimeSpent: Number(stats.totalTimeSpent),
        averageCompletion: Number(stats.averageCompletion),
      },
      pagination: {
        page,
        limit,
        total: Number(count),
        totalPages: Math.ceil(Number(count) / limit),
      },
    });
  } catch (error) {
    console.error("Reading history API error:", error);
    return NextResponse.json({ error: "Failed to fetch reading history" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
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

    const body = await request.json();
    const { articleId } = body;

    if (articleId) {
      await db.delete(readingHistory).where(
        and(
          eq(readingHistory.userId, session.userId),
          eq(readingHistory.articleId, articleId)
        )
      );
    } else {
      await db.delete(readingHistory).where(eq(readingHistory.userId, session.userId));
    }

    return NextResponse.json({ message: "History cleared successfully" });
  } catch (error) {
    console.error("Delete history error:", error);
    return NextResponse.json({ error: "Failed to delete history" }, { status: 500 });
  }
}