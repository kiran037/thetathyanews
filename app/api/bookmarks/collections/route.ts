///app/api/bookmarks/collections/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { bookmarkCollections } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { verifySession, unauthorizedResponse } from "@/lib/middleware";

export async function GET(req: NextRequest) {
  try {
    const authContext = await verifySession(req);
    if (!authContext) {
      return unauthorizedResponse();
    }

    const collections = await db
      .select()
      .from(bookmarkCollections)
      .where(eq(bookmarkCollections.userId, authContext.user.id))
      .orderBy(desc(bookmarkCollections.updatedAt));

    return NextResponse.json({ collections });
  } catch (error) {
    console.error("Get collections error:", error);
    return NextResponse.json(
      { error: "Failed to fetch collections" },
      { status: 500 }
    );
  }
}

import { z } from "zod";
import { and } from "drizzle-orm";

const createCollectionSchema = z.object({
  name: z.string().trim().min(1, "Collection name is required").max(100, "Collection name cannot exceed 100 characters"),
  description: z.string().trim().max(500, "Description cannot exceed 500 characters").optional().nullable(),
  isPublic: z.boolean().optional().default(false),
});

const updateCollectionSchema = z.object({
  id: z.string().uuid("Invalid collection ID"),
  name: z.string().trim().min(1, "Collection name is required").max(100, "Collection name cannot exceed 100 characters").optional(),
  description: z.string().trim().max(500, "Description cannot exceed 500 characters").optional().nullable(),
  isPublic: z.boolean().optional(),
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

    const parseResult = createCollectionSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.issues[0]?.message || "Invalid collection data" },
        { status: 400 }
      );
    }

    const { name, description, isPublic } = parseResult.data;

    const [collection] = await db
      .insert(bookmarkCollections)
      .values({
        userId: authContext.user.id,
        name,
        description: description || null,
        isPublic: isPublic || false,
        bookmarkCount: 0,
      })
      .returning();

    return NextResponse.json({
      message: "Collection created successfully",
      collection,
    });
  } catch (error) {
    console.error("Create collection error:", error);
    return NextResponse.json(
      { error: "Failed to create collection" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const authContext = await verifySession(req);
    if (!authContext) {
      return unauthorizedResponse();
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parseResult = updateCollectionSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.issues[0]?.message || "Invalid collection data" },
        { status: 400 }
      );
    }

    const { id, name, description, isPublic } = parseResult.data;

    // Verify ownership and update directly
    const [updated] = await db
      .update(bookmarkCollections)
      .set({
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description: description || null }),
        ...(isPublic !== undefined && { isPublic }),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(bookmarkCollections.id, id),
          eq(bookmarkCollections.userId, authContext.user.id)
        )
      )
      .returning();

    if (!updated) {
      return NextResponse.json(
        { error: "Collection not found or unauthorized" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Collection updated successfully",
      collection: updated,
    });
  } catch (error) {
    console.error("Update collection error:", error);
    return NextResponse.json(
      { error: "Failed to update collection" },
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
    const collectionId = searchParams.get("id");

    if (!collectionId) {
      return NextResponse.json(
        { error: "Collection ID is required" },
        { status: 400 }
      );
    }

    // Delete collection enforcing ownership directly
    const deleted = await db
      .delete(bookmarkCollections)
      .where(
        and(
          eq(bookmarkCollections.id, collectionId),
          eq(bookmarkCollections.userId, authContext.user.id)
        )
      )
      .returning({ id: bookmarkCollections.id });

    if (deleted.length === 0) {
      return NextResponse.json(
        { error: "Collection not found or unauthorized" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Collection deleted successfully" });
  } catch (error) {
    console.error("Delete collection error:", error);
    return NextResponse.json(
      { error: "Failed to delete collection" },
      { status: 500 }
    );
  }
}