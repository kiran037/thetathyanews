///app/api/account/delete/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, sessions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifySession, unauthorizedResponse, getClientInfo } from "@/lib/middleware";
import { verifyPassword, clearSessionCookie, logAudit } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const authContext = await verifySession(req);
    if (!authContext) {
      return unauthorizedResponse();
    }

    const body = await req.json();
    const { password, confirmation } = body;
    const { ipAddress, userAgent } = getClientInfo(req);

    if (!password || confirmation !== "DELETE") {
      return NextResponse.json(
        { error: "Password and confirmation required" },
        { status: 400 }
      );
    }

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

    // Verify password
    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: "Incorrect password" },
        { status: 400 }
      );
    }

    // Log before deletion
    await logAudit(
      authContext.user.id,
      "delete",
      "users",
      authContext.user.id,
      { action: "account_deleted" },
      ipAddress,
      userAgent
    );

    // Soft delete user
    await db
      .update(users)
      .set({
        deletedAt: new Date(),
        email: `deleted-${user.id}@thetathyanews.com`,
        passwordHash: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, authContext.user.id));

    // Delete all sessions
    await db
      .delete(sessions)
      .where(eq(sessions.userId, authContext.user.id));

    // Clear session cookie
    await clearSessionCookie();

    return NextResponse.json({
      message: "Account deleted successfully",
    });
  } catch (error) {
    console.error("Delete account error:", error);
    return NextResponse.json(
      { error: "Failed to delete account" },
      { status: 500 }
    );
  }
}