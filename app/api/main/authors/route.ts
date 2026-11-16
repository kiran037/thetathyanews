// File: app/api/main/authors/route.ts
// API endpoint for listing all authors with article counts and stats

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { authors, articles } from "@/db/schema";
import { eq, desc, asc, sql, and } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sortBy = searchParams.get("sortBy") || "articles"; // articles, name, recent, views
    const limit = parseInt(searchParams.get("limit") || "100");
    const staffOnly = searchParams.get("staffOnly") === "true";
    const verifiedOnly = searchParams.get("verifiedOnly") === "true";

    // Build where conditions
    const conditions = [];
    if (staffOnly) {
      conditions.push(eq(authors.isStaff, true));
    }
    if (verifiedOnly) {
      conditions.push(eq(authors.isVerified, true));
    }

    // 1. Define subqueries (SQL fragments) so we can use them in both SELECT and ORDER BY
    // Subquery for Latest Article Date
    const latestArticleDateSq = sql<Date>`(
      SELECT MAX(${articles.publishedAt})
      FROM ${articles}
      WHERE ${articles.primaryAuthorId} = ${authors.id}
        AND ${articles.status} = 'published'
        AND ${articles.deletedAt} IS NULL
    )`;

    // Subquery for Total Views
    const totalViewsSq = sql<number>`(
      SELECT COALESCE(SUM(${articles.viewCount}), 0)
      FROM ${articles}
      WHERE ${articles.primaryAuthorId} = ${authors.id}
        AND ${articles.status} = 'published'
        AND ${articles.deletedAt} IS NULL
    )`;

    // 2. Determine Sorting Logic
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
        // Default to article count (assuming metadata is kept up to date)
        // If articleCount isn't reliable, you can replace with a count(*) subquery
        orderByClause = desc(authors.articleCount);
        break;
    }

    // 3. Execute Query
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

    return NextResponse.json({
      authors: authorsList.map((author) => ({
        ...author,
        totalViews: Number(author.totalViews), // Ensure number type from string/bigint
      })),
      total: authorsList.length,
    });
  } catch (error) {
    console.error("Authors API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch authors" },
      { status: 500 }
    );
  }
}