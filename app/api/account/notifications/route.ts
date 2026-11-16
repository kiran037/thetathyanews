///app/api/account/notifications/route.ts
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
    const notifications = prefs.notifications || {
      emailNewsletter: true,
      emailArticles: true,
      emailComments: false,
      emailMarketing: false,
      pushEnabled: false,
    };

    return NextResponse.json({ notifications });
  } catch (error) {
    console.error("Get notifications error:", error);
    return NextResponse.json(
      { error: "Failed to fetch notification settings" },
      { status: 500 }
    );
  }
}

import { z } from "zod";

const updateNotificationsSchema = z.object({
  emailNewsletter: z.boolean().optional(),
  emailArticles: z.boolean().optional(),
  emailComments: z.boolean().optional(),
  emailMarketing: z.boolean().optional(),
  pushEnabled: z.boolean().optional(),
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

    const parseResult = updateNotificationsSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.issues[0]?.message || "Invalid notification preferences" },
        { status: 400 }
      );
    }

    const validNotifications = parseResult.data;
    const { ipAddress, userAgent } = getClientInfo(req);

    // Get current preferences
    const [user] = await db
      .select({ preferences: users.preferences })
      .from(users)
      .where(eq(users.id, authContext.user.id))
      .limit(1);

    const currentPrefs = (user?.preferences as any) || {};
    
    // Update notifications in preferences
    const updatedPrefs = {
      ...currentPrefs,
      notifications: {
        ...(currentPrefs.notifications || {}),
        ...validNotifications,
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
      { action: "notification_preferences_updated", settings: body },
      ipAddress,
      userAgent
    );

    return NextResponse.json({ message: "Notification preferences updated successfully" });
  } catch (error) {
    console.error("Update notifications error:", error);
    return NextResponse.json(
      { error: "Failed to update notification settings" },
      { status: 500 }
    );
  }
}