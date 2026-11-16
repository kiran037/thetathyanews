// File: app/api/main/reading-progress/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { readingHistory } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { verifySession } from "@/lib/middleware";
import { z } from "zod";

const progressSchema = z.object({
  articleId: z.string().uuid("Invalid article ID"),
  readPercentage: z.number().int().min(0).max(100),
  scrollDepth: z.number().int().min(0).max(100),
  timeSpentSeconds: z.number().int().min(0),
  isCompleted: z.boolean().default(false),
});

export async function POST(request: NextRequest) {
  try {
    const authContext = await verifySession(request);
    if (!authContext) {
      // Guest users handle progress locally in browser localStorage
      return NextResponse.json({ success: true, guest: true });
    }

    const body = await request.json();
    const validated = progressSchema.parse(body);

    const now = new Date();

    await db
      .insert(readingHistory)
      .values({
        userId: authContext.user.id,
        articleId: validated.articleId,
        readPercentage: validated.readPercentage,
        scrollDepth: validated.scrollDepth,
        timeSpentSeconds: validated.timeSpentSeconds,
        isCompleted: validated.isCompleted || validated.readPercentage >= 90,
        lastReadAt: now,
        firstReadAt: now,
      })
      .onConflictDoUpdate({
        target: [readingHistory.userId, readingHistory.articleId],
        set: {
          readPercentage: validated.readPercentage,
          scrollDepth: validated.scrollDepth,
          timeSpentSeconds: validated.timeSpentSeconds,
          isCompleted: validated.isCompleted || validated.readPercentage >= 90,
          lastReadAt: now,
        },
      });

    return NextResponse.json({ success: true, saved: true });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message || "Validation failed" }, { status: 400 });
    }
    console.error("Reading progress save error:", error);
    return NextResponse.json({ error: "Failed to record reading progress" }, { status: 500 });
  }
}
