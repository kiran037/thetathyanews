///app/api/account/password/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, sessions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifySession, unauthorizedResponse, getClientInfo } from "@/lib/middleware";
import { verifyPassword, hashPassword, logAudit } from "@/lib/auth";
import { passwordSchema } from "@/lib/validation";
import { z } from "zod";

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: passwordSchema,
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

    const parseResult = changePasswordSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.issues[0]?.message || "Invalid password data" },
        { status: 400 }
      );
    }

    const { currentPassword, newPassword } = parseResult.data;
    const { ipAddress, userAgent } = getClientInfo(req);

    // Get user with password
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, authContext.user.id))
      .limit(1);

    if (!user || !user.passwordHash) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Verify current password
    const isValid = await verifyPassword(currentPassword, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 400 }
      );
    }

    // Hash new password
    const newPasswordHash = await hashPassword(newPassword);

    // Update password
    await db
      .update(users)
      .set({
        passwordHash: newPasswordHash,
        updatedAt: new Date(),
      })
      .where(eq(users.id, authContext.user.id));

    // Invalidate all sessions except current
    await db
      .delete(sessions)
      .where(
        eq(sessions.userId, authContext.user.id)
      );

    // Log audit
    await logAudit(
      authContext.user.id,
      "password_change",
      "users",
      authContext.user.id,
      { method: "user_requested" },
      ipAddress,
      userAgent
    );

    return NextResponse.json({
      message: "Password changed successfully. Please log in again.",
    });
  } catch (error) {
    console.error("Change password error:", error);
    return NextResponse.json(
      { error: "Failed to change password" },
      { status: 500 }
    );
  }
}