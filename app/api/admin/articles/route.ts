// File: app/api/admin/articles/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { articles, articleStatusEnum } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifySession, checkPermission } from "@/lib/middleware";
import { sanitizeArticleHtml } from "@/lib/sanitizer";
import { z } from "zod";

const createArticleSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  slug: z.string().min(3, "Slug must be at least 3 characters"),
  excerpt: z.string().optional().nullable(),
  content: z.string().min(10, "Content must be at least 10 characters"),
  categoryId: z.string().uuid("Invalid category ID"),
  primaryAuthorId: z.string().uuid("Invalid author ID"),
  coverImageUrl: z.string().url("Invalid image URL").optional().nullable(),
  coverImageAlt: z.string().optional().nullable(),
  readingTimeMinutes: z.number().int().min(1).default(3),
  status: z.enum(["draft", "published", "archived"] as const).default("published"),
  isFeatured: z.boolean().default(false),
});

const patchArticleSchema = z.object({
  articleId: z.string().uuid("Invalid article ID"),
  status: z.enum(["draft", "published", "archived"] as const).optional(),
  isFeatured: z.boolean().optional(),
  title: z.string().min(3).optional(),
  content: z.string().min(10).optional(),
  excerpt: z.string().optional().nullable(),
});

export async function POST(request: NextRequest) {
  try {
    const authContext = await verifySession(request);
    if (!authContext) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const hasAccess = await checkPermission(authContext.user.id, "admin-access");
    if (!hasAccess) {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const body = await request.json();
    const validated = createArticleSchema.parse(body);

    // Check slug uniqueness
    const existing = await db.query.articles.findFirst({
      where: eq(articles.slug, validated.slug),
    });

    if (existing) {
      return NextResponse.json({ error: "An article with this slug already exists" }, { status: 400 });
    }

    const sanitizedContent = sanitizeArticleHtml(validated.content);

    const [newArticle] = await db
      .insert(articles)
      .values({
        title: validated.title,
        slug: validated.slug,
        excerpt: validated.excerpt || null,
        content: sanitizedContent,
        categoryId: validated.categoryId,
        primaryAuthorId: validated.primaryAuthorId,
        coverImageUrl: validated.coverImageUrl || null,
        coverImageAlt: validated.coverImageAlt || null,
        readingTimeMinutes: validated.readingTimeMinutes,
        status: validated.status,
        isFeatured: validated.isFeatured,
        publishedAt: validated.status === "published" ? new Date() : null,
      })
      .returning();

    return NextResponse.json({
      message: "Article created successfully",
      article: newArticle,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message || "Validation failed" }, { status: 400 });
    }
    console.error("Admin article create error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authContext = await verifySession(request);
    if (!authContext) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const hasAccess = await checkPermission(authContext.user.id, "admin-access");
    if (!hasAccess) {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const body = await request.json();
    const validated = patchArticleSchema.parse(body);

    const updateData: Record<string, any> = { updatedAt: new Date() };
    if (validated.status !== undefined) {
      updateData.status = validated.status;
      if (validated.status === "published") {
        updateData.publishedAt = new Date();
      }
    }
    if (validated.isFeatured !== undefined) {
      updateData.isFeatured = validated.isFeatured;
    }
    if (validated.title !== undefined) {
      updateData.title = validated.title;
    }
    if (validated.content !== undefined) {
      updateData.content = sanitizeArticleHtml(validated.content);
    }
    if (validated.excerpt !== undefined) {
      updateData.excerpt = validated.excerpt;
    }

    await db
      .update(articles)
      .set(updateData)
      .where(eq(articles.id, validated.articleId));

    return NextResponse.json({ message: "Article updated successfully" });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message || "Validation failed" }, { status: 400 });
    }
    console.error("Admin article patch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authContext = await verifySession(request);
    if (!authContext) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const hasAccess = await checkPermission(authContext.user.id, "admin-access");
    if (!hasAccess) {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const id = request.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Article ID required" }, { status: 400 });
    }

    // Soft delete
    await db
      .update(articles)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(eq(articles.id, id));

    return NextResponse.json({ message: "Article archived successfully" });
  } catch (error: any) {
    console.error("Admin article delete error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
