// File: app/api/main/sidebar/route.ts
import { NextResponse } from "next/server";
import { db } from "@/db";
// 1. Added missing imports (tags, articleTags)
import { 
  articles, 
  categories, 
  tags, 
  articleTags 
} from "@/db/schema";
import { eq, desc, and, sql, gte } from "drizzle-orm";

export const dynamic = 'force-dynamic'; // Ensure this endpoint isn't statically cached

export async function GET() {
  try {
    // ==========================================
    // 1. Trending Topics 
    // Logic: Tags with most articles published in last 30 days
    // ==========================================
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const trendingTopics = await db
      .select({
        name: tags.name,
        slug: tags.slug,
        // SQL cast to ensure we get a number, as count returns string/bigint often
        count: sql<number>`cast(count(${articleTags.articleId}) as int)`,
      })
      .from(tags)
      .leftJoin(articleTags, eq(tags.id, articleTags.tagId))
      .leftJoin(articles, eq(articleTags.articleId, articles.id))
      .where(
        and(
          eq(articles.status, "published"),
          gte(articles.publishedAt, thirtyDaysAgo),
          sql`${articles.deletedAt} IS NULL`
        )
      )
      .groupBy(tags.id, tags.name, tags.slug)
      .orderBy(desc(sql`count(${articleTags.articleId})`))
      .limit(5);

    // ==========================================
    // 2. Popular Articles
    // Logic: Most views in last 7 days
    // ==========================================
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const rawPopularArticles = await db
      .select({
        id: articles.id,
        slug: articles.slug,
        title: articles.title,
        viewCount: articles.viewCount,
        publishedAt: articles.publishedAt,
        // Flattened selection (cannot nest objects in .select())
        categoryName: categories.name,
        categorySlug: categories.slug,
      })
      .from(articles)
      .leftJoin(categories, eq(articles.categoryId, categories.id))
      .where(
        and(
          eq(articles.status, "published"),
          gte(articles.publishedAt, sevenDaysAgo),
          sql`${articles.deletedAt} IS NULL`
        )
      )
      .orderBy(desc(articles.viewCount))
      .limit(3);

    // ==========================================
    // 3. Response Formatting
    // ==========================================
    return NextResponse.json({
      trendingTopics,
      popularArticles: rawPopularArticles.map((article) => ({
        id: article.id,
        slug: article.slug,
        title: article.title,
        viewCount: article.viewCount,
        publishedAt: article.publishedAt,
        category: article.categoryName
          ? {
              name: article.categoryName,
              slug: article.categorySlug,
            }
          : null,
      })),
    });

  } catch (error) {
    console.error("Sidebar API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch sidebar data" },
      { status: 500 }
    );
  }
}