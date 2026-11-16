// File: app/api/search/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { articles, categories, authors } from "@/db/schema";
import { eq, and, or, sql, desc, SQL } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";
    const categorySlug = searchParams.get("category");
    const authorSlug = searchParams.get("author");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const offset = (page - 1) * limit;

    // 1. Build Conditions
    const conditions: SQL[] = [
      eq(articles.status, "published"),
      eq(articles.visibility, "public"),
      sql`${articles.deletedAt} IS NULL`
    ];

    // Text search
    if (query) {
      const searchTerm = `%${query.toLowerCase()}%`;
      conditions.push(
        or(
          sql`LOWER(${articles.title}) LIKE ${searchTerm}`,
          sql`LOWER(${articles.excerpt}) LIKE ${searchTerm}`,
          sql`LOWER(${articles.content}) LIKE ${searchTerm}`
        )!
      );
    }

    // Category filter
    if (categorySlug) {
      const cat = await db.query.categories.findFirst({
        where: eq(categories.slug, categorySlug),
        columns: { id: true }
      });
      if (cat) conditions.push(eq(articles.categoryId, cat.id));
    }

    // Author filter
    if (authorSlug) {
      const auth = await db.query.authors.findFirst({
        where: eq(authors.slug, authorSlug),
        columns: { id: true }
      });
      if (auth) conditions.push(eq(articles.primaryAuthorId, auth.id));
    }

    // 2. Fetch Data
    const results = await db
      .select({
        id: articles.id,
        slug: articles.slug,
        title: articles.title,
        excerpt: articles.excerpt,
        coverImageUrl: articles.coverImageUrl,
        publishedAt: articles.publishedAt,
        readingTimeMinutes: articles.readingTimeMinutes,
        viewCount: articles.viewCount,
        commentCount: articles.commentCount,
        categoryName: categories.name,
        categorySlug: categories.slug,
        authorName: authors.displayName,
        authorSlug: authors.slug,
      })
      .from(articles)
      .leftJoin(categories, eq(articles.categoryId, categories.id))
      .leftJoin(authors, eq(articles.primaryAuthorId, authors.id))
      .where(and(...conditions))
      .orderBy(desc(articles.publishedAt))
      .limit(limit)
      .offset(offset);

    // 3. Get total count (Fixing the cast issue)
    const [{ count }] = await db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(articles)
      .where(and(...conditions));

    return NextResponse.json({
      results,
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
    });

  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json(
      { error: "Search failed" },
      { status: 500 }
    );
  }
}