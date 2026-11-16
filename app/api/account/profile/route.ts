///app/api/account/profile/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifySession, unauthorizedResponse } from "@/lib/middleware";
import { logAudit } from "@/lib/auth";
import { getClientInfo } from "@/lib/middleware";

export async function GET(req: NextRequest) {
  try {
    const authContext = await verifySession(req);
    if (!authContext) {
      return unauthorizedResponse();
    }

    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        displayName: users.displayName,
        avatarUrl: users.avatarUrl,
        bio: users.bio,
        locale: users.locale,
        timezone: users.timezone,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, authContext.user.id))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Get profile error:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

import { z } from "zod";

const updateProfileSchema = z.object({
  firstName: z.string().trim().max(100, "First name cannot exceed 100 characters").optional().nullable(),
  lastName: z.string().trim().max(100, "Last name cannot exceed 100 characters").optional().nullable(),
  displayName: z.string().trim().min(1, "Display name is required").max(200, "Display name cannot exceed 200 characters").optional().nullable(),
  bio: z.string().trim().max(1000, "Bio cannot exceed 1000 characters").optional().nullable(),
  avatarUrl: z.string().url("Invalid avatar URL").max(2000).optional().nullable().or(z.literal("")),
  locale: z.string().trim().max(10).optional().nullable(),
  timezone: z.string().trim().max(50).optional().nullable(),
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

    const parseResult = updateProfileSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.issues[0]?.message || "Invalid profile data" },
        { status: 400 }
      );
    }

    const { firstName, lastName, displayName, bio, avatarUrl, locale, timezone } = parseResult.data;
    const { ipAddress, userAgent } = getClientInfo(req);

    // Update user - strictly allow only safe fields
    await db
      .update(users)
      .set({
        ...(firstName !== undefined && { firstName: firstName || null }),
        ...(lastName !== undefined && { lastName: lastName || null }),
        ...(displayName !== undefined && { displayName: displayName || null }),
        ...(bio !== undefined && { bio: bio || null }),
        ...(avatarUrl !== undefined && { avatarUrl: avatarUrl || null }),
        ...(locale !== undefined && { locale: locale || "en" }),
        ...(timezone !== undefined && { timezone: timezone || "UTC" }),
        updatedAt: new Date(),
      })
      .where(eq(users.id, authContext.user.id));

    // Log audit
    await logAudit(
      authContext.user.id,
      "update",
      "users",
      authContext.user.id,
      { action: "profile_updated", changes: body },
      ipAddress,
      userAgent
    );

    return NextResponse.json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}