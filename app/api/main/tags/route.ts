// File: app/api/main/tags/route.ts
// API endpoint for listing all tags with article counts

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { tags, articles, articleTags } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sortBy = searchParams.get("sortBy") || "count"; // name, count, recent
    const limit = parseInt(searchParams.get("limit") || "100");
    const minCount = parseInt(searchParams.get("minCount") || "1");

    // Get tags with article counts
    const tagsList = await db
      .select({
        id: tags.id,
        name: tags.name,
        slug: tags.slug,
        description: tags.description,
        // color: tags.color, // REMOVED: Not in schema
        isVisible: tags.isVisible, // FIXED: isActive -> isVisible
        articleCount: sql<number>`(
          SELECT COUNT(DISTINCT ${articleTags.articleId})
          FROM ${articleTags}
          INNER JOIN ${articles} ON ${articles.id} = ${articleTags.articleId}
          WHERE ${articleTags.tagId} = ${tags.id}
            AND ${articles.status} = 'published'
            AND ${articles.deletedAt} IS NULL
        )`,
        latestArticleDate: sql<Date>`(
          SELECT MAX(${articles.publishedAt})
          FROM ${articleTags}
          INNER JOIN ${articles} ON ${articles.id} = ${articleTags.articleId}
          WHERE ${articleTags.tagId} = ${tags.id}
            AND ${articles.status} = 'published'
            AND ${articles.deletedAt} IS NULL
        )`,
      })
      .from(tags)
      .where(eq(tags.isVisible, true)) // FIXED: isActive -> isVisible
      .limit(limit);

    // Filter by minimum count
    const filtered = tagsList.filter((tag) => Number(tag.articleCount) >= minCount);

    // Sort based on sortBy parameter
    let sorted = filtered;
    if (sortBy === "count") {
      sorted = filtered.sort((a, b) => Number(b.articleCount) - Number(a.articleCount));
    } else if (sortBy === "recent") {
      sorted = filtered.sort((a, b) => {
        const dateA = a.latestArticleDate ? new Date(a.latestArticleDate).getTime() : 0;
        const dateB = b.latestArticleDate ? new Date(b.latestArticleDate).getTime() : 0;
        return dateB - dateA;
      });
    } else {
      sorted = filtered.sort((a, b) => a.name.localeCompare(b.name));
    }

    return NextResponse.json({
      tags: sorted.map((tag) => ({
        ...tag,
        articleCount: Number(tag.articleCount),
      })),
      total: sorted.length,
    });
  } catch (error) {
    console.error("Tags API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch tags" },
      { status: 500 }
    );
  }
}