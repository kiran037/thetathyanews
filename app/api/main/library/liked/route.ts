// File: app/api/main/library/liked/route.ts
// API endpoint for user's liked/reacted articles

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/db/index";
import { reactions, articles, categories, authors } from "@/db/schema";
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
    const reactionType = searchParams.get("type");
    const offset = (page - 1) * limit;

    const conditions = [
      eq(reactions.userId, session.userId),
      sql`${reactions.articleId} IS NOT NULL`,
    ];

    if (reactionType) {
      conditions.push(eq(reactions.reactionType, reactionType as any));
    }

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(reactions)
      .where(and(...conditions));

    const likedArticles = await db
      .select({
        id: reactions.id,
        reactionType: reactions.reactionType,
        createdAt: reactions.createdAt,
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
          reactionCount: articles.reactionCount,
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
      .from(reactions)
      .innerJoin(articles, eq(reactions.articleId, articles.id))
      .leftJoin(categories, eq(articles.categoryId, categories.id))
      .leftJoin(authors, eq(articles.primaryAuthorId, authors.id))
      .where(and(...conditions))
      .orderBy(desc(reactions.createdAt))
      .limit(limit)
      .offset(offset);

    const reactionCounts = await db
      .select({
        reactionType: reactions.reactionType,
        count: sql<number>`count(*)`,
      })
      .from(reactions)
      .where(and(eq(reactions.userId, session.userId), sql`${reactions.articleId} IS NOT NULL`))
      .groupBy(reactions.reactionType);

    return NextResponse.json({
      articles: likedArticles,
      reactionCounts: reactionCounts.map((rc) => ({
        type: rc.reactionType,
        count: Number(rc.count),
      })),
      pagination: {
        page,
        limit,
        total: Number(count),
        totalPages: Math.ceil(Number(count) / limit),
      },
    });
  } catch (error) {
    console.error("Liked articles API error:", error);
    return NextResponse.json({ error: "Failed to fetch liked articles" }, { status: 500 });
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

    if (!articleId) {
      return NextResponse.json({ error: "Article ID required" }, { status: 400 });
    }

    await db.delete(reactions).where(
      and(
        eq(reactions.userId, session.userId),
        eq(reactions.articleId, articleId)
      )
    );

    return NextResponse.json({ message: "Reaction removed successfully" });
  } catch (error) {
    console.error("Delete reaction error:", error);
    return NextResponse.json({ error: "Failed to remove reaction" }, { status: 500 });
  }
}