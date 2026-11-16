// File: app/api/main/articles/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { articles, categories, authors, articleStatusEnum } from "@/db/schema";
import { eq, desc, and, sql, SQL } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    
    // Filters
    const categorySlug = searchParams.get("category");
    // Ensure status is cast to the correct type for the Enum
    const status = (searchParams.get("status") as typeof articleStatusEnum.enumValues[number]) || "published";
    const featured = searchParams.get("featured");
    
    const offset = (page - 1) * limit;

    // 1. Build Conditions
    const conditions: SQL[] = [
      eq(articles.status, status),
      sql`${articles.deletedAt} IS NULL`,
    ];

    if (categorySlug) {
      // Optimization: Join logic is better, but fetching ID first is safer for exact slug matching
      const cat = await db.query.categories.findFirst({
        columns: { id: true },
        where: eq(categories.slug, categorySlug),
      });
      
      if (cat) {
        conditions.push(eq(articles.categoryId, cat.id));
      } else {
        // If category provided but not found, return empty result immediately
        return NextResponse.json({
          articles: [],
          pagination: { page, limit, total: 0, totalPages: 0 },
        });
      }
    }

    if (featured === "true") {
      conditions.push(eq(articles.isFeatured, true));
    }

    // 2. Get total count (for pagination)
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(articles)
      .where(and(...conditions));

    // 3. Get articles with relations
    // NOTE: We select flat fields here to avoid SQL errors, then restructure in the map function.
    const rawArticles = await db
      .select({
        // Article fields
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
        
        // Category fields (Aliased)
        categoryId: categories.id,
        categoryName: categories.name,
        categorySlug: categories.slug,
        
        // Author fields (Aliased)
        authorId: authors.id,
        authorName: authors.displayName,
        authorSlug: authors.slug,
        authorAvatar: authors.avatarUrl,
      })
      .from(articles)
      .leftJoin(categories, eq(articles.categoryId, categories.id))
      .leftJoin(authors, eq(articles.primaryAuthorId, authors.id))
      .where(and(...conditions))
      .orderBy(desc(articles.publishedAt))
      .limit(limit)
      .offset(offset);

    // 4. Restructure data for API response
    const formattedArticles = rawArticles.map((row) => ({
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
      category: row.categoryId ? {
        id: row.categoryId,
        name: row.categoryName,
        slug: row.categorySlug,
      } : null,
      primaryAuthor: row.authorId ? {
        id: row.authorId,
        displayName: row.authorName,
        slug: row.authorSlug,
        avatarUrl: row.authorAvatar,
      } : null,
    }));

    return NextResponse.json({
      articles: formattedArticles,
      pagination: {
        page,
        limit,
        total: Number(count),
        totalPages: Math.ceil(Number(count) / limit),
      },
    });
  } catch (error) {
    console.error("Articles API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch articles" },
      { status: 500 }
    );
  }
}