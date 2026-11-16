// File: app/api/admin/settings/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { systemSettings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifySession, checkPermission } from "@/lib/middleware";
import { z } from "zod";

const settingsSchema = z.object({
  site_name: z.string().min(1).max(100),
  site_tagline: z.string().max(200).optional(),
  contact_email: z.string().email(),
  allow_comments: z.boolean().default(true),
  require_comment_approval: z.boolean().default(false),
  enable_paywall: z.boolean().default(false),
  free_articles_limit: z.number().int().min(1).max(100).default(5),
});

export async function PUT(request: NextRequest) {
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
    const validated = settingsSchema.parse(body);

    for (const [key, value] of Object.entries(validated)) {
      await db
        .insert(systemSettings)
        .values({
          key,
          value,
          valueType: typeof value,
          updatedBy: authContext.user.id,
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: systemSettings.key,
          set: {
            value,
            valueType: typeof value,
            updatedBy: authContext.user.id,
            updatedAt: new Date(),
          },
        });
    }

    return NextResponse.json({ message: "Settings saved successfully" });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message || "Validation failed" }, { status: 400 });
    }
    console.error("Admin settings update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
