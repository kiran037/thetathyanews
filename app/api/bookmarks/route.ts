// File: app/api/bookmarks/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { bookmarks, articles, categories, authors, bookmarkCollections } from "@/db/schema";
import { eq, desc, and, isNull, type SQL } from "drizzle-orm";
import { verifySession, unauthorizedResponse } from "@/lib/middleware";

export async function GET(req: NextRequest) {
  try {
    const authContext = await verifySession(req);
    if (!authContext) {
      return unauthorizedResponse();
    }

    const { searchParams } = new URL(req.url);
    const collectionId = searchParams.get("collectionId");

    // 1. Build an array of conditions dynamically
    // We always require the user to match the logged-in user
    const conditions: SQL[] = [eq(bookmarks.userId, authContext.user.id)];

    // 2. Add specific filter conditions based on the URL param
    if (collectionId === "uncategorized") {
      conditions.push(isNull(bookmarks.collectionId));
    } else if (collectionId) {
      conditions.push(eq(bookmarks.collectionId, collectionId));
    }

    // 3. Execute the query passing all conditions at once using `and(...)`
    const userBookmarks = await db
      .select({
        id: bookmarks.id,
        note: bookmarks.note,
        createdAt: bookmarks.createdAt,
        collectionId: bookmarks.collectionId,
        articleId: articles.id,
        articleSlug: articles.slug,
        articleTitle: articles.title,
        articleExcerpt: articles.excerpt,
        articleCoverImage: articles.coverImageUrl,
        articleReadingTime: articles.readingTimeMinutes,
        categoryName: categories.name,
        categorySlug: categories.slug,
        authorName: authors.displayName,
      })
      .from(bookmarks)
      .innerJoin(articles, eq(bookmarks.articleId, articles.id))
      .leftJoin(categories, eq(articles.categoryId, categories.id))
      .leftJoin(authors, eq(articles.primaryAuthorId, authors.id))
      .where(and(...conditions)) // Spread the conditions array here
      .orderBy(desc(bookmarks.createdAt));

    return NextResponse.json({ bookmarks: userBookmarks });
  } catch (error) {
    console.error("Get bookmarks error:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookmarks" },
      { status: 500 }
    );
  }
}

import { z } from "zod";

const createBookmarkSchema = z.object({
  articleId: z.string().uuid("Invalid article ID"),
  collectionId: z.string().uuid("Invalid collection ID").optional().nullable(),
  note: z.string().trim().max(1000, "Note cannot exceed 1000 characters").optional().nullable(),
});

export async function POST(req: NextRequest) {
  try {
    const authContext = await verifySession(req);
    if (!authContext) {
      return unauthorizedResponse();
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parseResult = createBookmarkSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.issues[0]?.message || "Invalid bookmark data" },
        { status: 400 }
      );
    }

    const { articleId, collectionId, note } = parseResult.data;

    // Check if already bookmarked
    const [existing] = await db
      .select()
      .from(bookmarks)
      .where(
        and(
          eq(bookmarks.userId, authContext.user.id),
          eq(bookmarks.articleId, articleId)
        )
      )
      .limit(1);

    if (existing) {
      return NextResponse.json(
        { error: "Article already bookmarked" },
        { status: 400 }
      );
    }

    // Create bookmark
    const [bookmark] = await db
      .insert(bookmarks)
      .values({
        userId: authContext.user.id,
        articleId,
        collectionId: collectionId || null,
        note: note || null,
      })
      .returning();

    // Update collection count if collection specified
    if (collectionId) {
      const count = await db.$count(bookmarks, eq(bookmarks.collectionId, collectionId));
      await db
        .update(bookmarkCollections)
        .set({
          bookmarkCount: count,
          updatedAt: new Date(),
        })
        .where(eq(bookmarkCollections.id, collectionId));
    }

    return NextResponse.json({ 
      message: "Bookmark created successfully",
      bookmark 
    });
  } catch (error) {
    console.error("Create bookmark error:", error);
    return NextResponse.json(
      { error: "Failed to create bookmark" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const authContext = await verifySession(req);
    if (!authContext) {
      return unauthorizedResponse();
    }

    const { searchParams } = new URL(req.url);
    const bookmarkId = searchParams.get("id");

    if (!bookmarkId) {
      return NextResponse.json(
        { error: "Bookmark ID is required" },
        { status: 400 }
      );
    }

    // Get bookmark to check ownership and get collection ID
    const [bookmark] = await db
      .select()
      .from(bookmarks)
      .where(
        and(
          eq(bookmarks.id, bookmarkId),
          eq(bookmarks.userId, authContext.user.id)
        )
      )
      .limit(1);

    if (!bookmark) {
      return NextResponse.json(
        { error: "Bookmark not found or unauthorized" },
        { status: 404 }
      );
    }

    // Delete bookmark enforcing ownership
    await db
      .delete(bookmarks)
      .where(
        and(
          eq(bookmarks.id, bookmarkId),
          eq(bookmarks.userId, authContext.user.id)
        )
      );

    // Update collection count if it was in a collection
    if (bookmark.collectionId) {
      const count = await db.$count(bookmarks, eq(bookmarks.collectionId, bookmark.collectionId));
      await db
        .update(bookmarkCollections)
        .set({
          bookmarkCount: count,
          updatedAt: new Date(),
        })
        .where(eq(bookmarkCollections.id, bookmark.collectionId));
    }

    return NextResponse.json({ message: "Bookmark removed successfully" });
  } catch (error) {
    console.error("Delete bookmark error:", error);
    return NextResponse.json(
      { error: "Failed to delete bookmark" },
      { status: 500 }
    );
  }
}