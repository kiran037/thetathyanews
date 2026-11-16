///app/api/account/preferences/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifySession, unauthorizedResponse, getClientInfo } from "@/lib/middleware";
import { logAudit } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const authContext = await verifySession(req);
    if (!authContext) {
      return unauthorizedResponse();
    }

    const [user] = await db
      .select({
        preferences: users.preferences,
      })
      .from(users)
      .where(eq(users.id, authContext.user.id))
      .limit(1);

    const prefs = (user?.preferences as any) || {};
    const appPreferences = prefs.app || {
      theme: "system",
      compactMode: false,
      autoplayVideos: true,
      showReadingTime: true,
    };

    return NextResponse.json({ preferences: appPreferences });
  } catch (error) {
    console.error("Get preferences error:", error);
    return NextResponse.json(
      { error: "Failed to fetch preferences" },
      { status: 500 }
    );
  }
}

import { z } from "zod";

const updatePreferencesSchema = z.object({
  theme: z.enum(["light", "dark", "system"]).optional(),
  compactMode: z.boolean().optional(),
  autoplayVideos: z.boolean().optional(),
  showReadingTime: z.boolean().optional(),
});

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

    const parseResult = updatePreferencesSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.issues[0]?.message || "Invalid preferences data" },
        { status: 400 }
      );
    }

    const validAppPrefs = parseResult.data;
    const { ipAddress, userAgent } = getClientInfo(req);

    // Get current preferences
    const [user] = await db
      .select({ preferences: users.preferences })
      .from(users)
      .where(eq(users.id, authContext.user.id))
      .limit(1);

    const currentPrefs = (user?.preferences as any) || {};
    
    // Update app preferences
    const updatedPrefs = {
      ...currentPrefs,
      app: {
        ...(currentPrefs.app || {}),
        ...validAppPrefs,
      },
    };

    await db
      .update(users)
      .set({
        preferences: updatedPrefs,
        updatedAt: new Date(),
      })
      .where(eq(users.id, authContext.user.id));

    // Log audit
    await logAudit(
      authContext.user.id,
      "update",
      "users",
      authContext.user.id,
      { action: "app_preferences_updated", settings: body },
      ipAddress,
      userAgent
    );

    return NextResponse.json({ message: "Preferences saved successfully" });
  } catch (error) {
    console.error("Update preferences error:", error);
    return NextResponse.json(
      { error: "Failed to update preferences" },
      { status: 500 }
    );
  }
}