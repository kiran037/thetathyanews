import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { comments, users, articles } from "@/db/schema";
import { eq, and, desc, sql, isNull } from "drizzle-orm";
import { verifySession } from "@/lib/middleware";
import { z } from "zod";

const createCommentSchema = z.object({
  content: z.string().trim().min(1, "Comment cannot be empty").max(2000, "Comment cannot exceed 2000 characters"),
  parentId: z.string().uuid("Invalid parent comment ID").optional().nullable(),
});

// 1. GET: Fetch Comments
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> } // Fix: Promise type
) {
  try {
    const { slug } = await params; // Fix: Await params
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;

    // Get article ID efficiently
    const article = await db.query.articles.findFirst({
      where: (articles, { eq }) => eq(articles.slug, slug),
      columns: { id: true },
    });

    if (!article) {
      return NextResponse.json(
        { error: "Article not found" },
        { status: 404 }
      );
    }

    // Get total count (Top-level only)
    const [{ count }] = await db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(comments)
      .where(
        and(
          eq(comments.articleId, article.id),
          eq(comments.status, "approved"),
          isNull(comments.parentId),
          isNull(comments.deletedAt)
        )
      );

    // Get comments with flattened user info
    const rawComments = await db
      .select({
        id: comments.id,
        content: comments.content,
        createdAt: comments.createdAt,
        likeCount: comments.likeCount,
        replyCount: comments.replyCount,
        isEdited: comments.isEdited,
        // Flat selection
        userId: users.id,
        userDisplayName: users.displayName,
        userAvatarUrl: users.avatarUrl,
      })
      .from(comments)
      .leftJoin(users, eq(comments.userId, users.id))
      .where(
        and(
          eq(comments.articleId, article.id),
          eq(comments.status, "approved"),
          isNull(comments.parentId),
          isNull(comments.deletedAt)
        )
      )
      .orderBy(desc(comments.createdAt))
      .limit(limit)
      .offset(offset);

    // Reconstruct nested structure
    const formattedComments = rawComments.map((c) => ({
      id: c.id,
      content: c.content,
      createdAt: c.createdAt,
      likeCount: c.likeCount,
      replyCount: c.replyCount,
      isEdited: c.isEdited,
      user: {
        id: c.userId,
        displayName: c.userDisplayName,
        avatarUrl: c.userAvatarUrl,
      },
    }));

    return NextResponse.json({
      comments: formattedComments,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error("Comments API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}

// 2. POST: Create Comment
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // 1. Authenticate user from session
    const authContext = await verifySession(request);
    if (!authContext || !authContext.user) {
      return NextResponse.json(
        { error: "Authentication required to post a comment" },
        { status: 401 }
      );
    }

    // 2. Validate input schema
    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const parseResult = createCommentSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.issues[0]?.message || "Invalid comment data" },
        { status: 400 }
      );
    }

    const { content, parentId } = parseResult.data;

    // 3. Verify article exists
    const article = await db.query.articles.findFirst({
      where: (articles, { eq }) => eq(articles.slug, slug),
      columns: { id: true },
    });

    if (!article) {
      return NextResponse.json(
        { error: "Article not found" },
        { status: 404 }
      );
    }

    // 4. If parentId provided, verify parent comment belongs to this article
    if (parentId) {
      const parentComment = await db.query.comments.findFirst({
        where: and(
          eq(comments.id, parentId),
          eq(comments.articleId, article.id)
        ),
        columns: { id: true },
      });

      if (!parentComment) {
        return NextResponse.json(
          { error: "Parent comment does not exist on this article" },
          { status: 400 }
        );
      }
    }

    // 5. Transaction: Insert comment with authenticated user ID and update counts
    const newComment = await db.transaction(async (tx) => {
      // 1. Insert the comment bound to authenticated user
      const [comment] = await tx
        .insert(comments)
        .values({
          articleId: article.id,
          userId: authContext.user.id, // Enforced authenticated session ID!
          content,
          parentId: parentId || null,
          status: "approved", // Match application auto-approve default
        })
        .returning();

      // 2. If it's a reply, increment parent's replyCount
      if (parentId) {
        await tx
          .update(comments)
          .set({ replyCount: sql`${comments.replyCount} + 1` })
          .where(eq(comments.id, parentId));
      }

      // 3. Increment article's total comment count
      await tx
        .update(articles)
        .set({ commentCount: sql`${articles.commentCount} + 1` })
        .where(eq(articles.id, article.id));

      return comment;
    });

    return NextResponse.json(
      {
        message: "Comment posted successfully",
        comment: newComment,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create comment error:", error);
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 }
    );
  }
}