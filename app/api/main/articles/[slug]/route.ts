// File: app/api/main/articles/[slug]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db"; // Ensure this imports from the fixed file above
import { articles } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const article = await db.query.articles.findFirst({
      where: and(
        eq(articles.slug, slug),
        eq(articles.status, "published"),
        sql`${articles.deletedAt} IS NULL`
      ),
      with: {
        category: true,
        primaryAuthor: true,
        authors: {
          with: {
            author: true,
          },
          // "articleAuthors" here refers to the join table in the schema
          orderBy: (articleAuthors, { asc }) => [asc(articleAuthors.displayOrder)],
        },
        tags: {
          with: {
            tag: true,
          },
        },
      },
    });

    if (!article) {
      return NextResponse.json(
        { error: "Article not found" },
        { status: 404 }
      );
    }

    // Atomic view count increment
    await db
      .update(articles)
      .set({
        viewCount: sql`${articles.viewCount} + 1`,
      })
      .where(eq(articles.id, article.id));

    // Flatten response for frontend
    const formattedArticle = {
      ...article,
      tags: article.tags.map((t) => t.tag),
      authors: article.authors.map((a) => ({
        ...a.author,
        contributionType: a.contributionType,
      })),
    };

    return NextResponse.json({ article: formattedArticle });
  } catch (error) {
    console.error("Article API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch article" },
      { status: 500 }
    );
  }
}