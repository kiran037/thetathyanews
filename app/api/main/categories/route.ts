// File: app/api/main/categories/route.ts
// API endpoint for listing all categories with article counts

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { categories, articles } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sortBy = searchParams.get("sortBy") || "name"; // name, count, recent
    const limit = parseInt(searchParams.get("limit") || "100");

    // Get categories with article counts
    const categoriesList = await db
      .select({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
        description: categories.description,
        color: categories.color,
        icon: categories.icon,
        imageUrl: categories.imageUrl, // Fixed: Schema uses imageUrl, not coverImageUrl
        displayOrder: categories.displayOrder,
        isVisible: categories.isVisible, // Fixed: Schema uses isVisible, not isActive
        articleCount: sql<number>`(
          SELECT COUNT(*)
          FROM ${articles}
          WHERE ${articles.categoryId} = ${categories.id}
            AND ${articles.status} = 'published'
            AND ${articles.deletedAt} IS NULL
        )`,
        latestArticleDate: sql<Date>`(
          SELECT MAX(${articles.publishedAt})
          FROM ${articles}
          WHERE ${articles.categoryId} = ${categories.id}
            AND ${articles.status} = 'published'
            AND ${articles.deletedAt} IS NULL
        )`,
      })
      .from(categories)
      .where(eq(categories.isVisible, true)) // Fixed: isActive -> isVisible
      .limit(limit);

    // Sort based on sortBy parameter
    let sorted = categoriesList;
    if (sortBy === "count") {
      sorted = categoriesList.sort((a, b) => Number(b.articleCount) - Number(a.articleCount));
    } else if (sortBy === "recent") {
      sorted = categoriesList.sort((a, b) => {
        const dateA = a.latestArticleDate ? new Date(a.latestArticleDate).getTime() : 0;
        const dateB = b.latestArticleDate ? new Date(b.latestArticleDate).getTime() : 0;
        return dateB - dateA;
      });
    } else {
      // Default sort by name or displayOrder if available
      sorted = categoriesList.sort((a, b) => {
        if (a.displayOrder !== b.displayOrder) {
          return (a.displayOrder || 0) - (b.displayOrder || 0);
        }
        return a.name.localeCompare(b.name);
      });
    }

    return NextResponse.json({
      categories: sorted.map((cat) => ({
        ...cat,
        articleCount: Number(cat.articleCount),
      })),
      total: sorted.length,
    });
  } catch (error) {
    console.error("Categories API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}