///app/api/account/sessions/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { sessions } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { verifySession, unauthorizedResponse } from "@/lib/middleware";

export async function GET(req: NextRequest) {
  try {
    const authContext = await verifySession(req);
    if (!authContext) {
      return unauthorizedResponse();
    }

    const userSessions = await db
      .select({
        id: sessions.id,
        ipAddress: sessions.ipAddress,
        userAgent: sessions.userAgent,
        deviceName: sessions.deviceName,
        lastActivityAt: sessions.lastActivityAt,
        createdAt: sessions.createdAt,
        expiresAt: sessions.expiresAt,
        isCurrent: eq(sessions.id, authContext.session.id),
      })
      .from(sessions)
      .where(eq(sessions.userId, authContext.user.id))
      .orderBy(desc(sessions.lastActivityAt));

    return NextResponse.json({ sessions: userSessions });
  } catch (error) {
    console.error("Get sessions error:", error);
    return NextResponse.json(
      { error: "Failed to fetch sessions" },
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
    const sessionId = searchParams.get("id");

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    // Don't allow deleting current session via this route
    if (sessionId === authContext.session.id) {
      return NextResponse.json(
        { error: "Use logout endpoint to end current session" },
        { status: 400 }
      );
    }

    // Delete the session - enforce both sessionId AND authenticated userId directly
    const deletedSessions = await db
      .delete(sessions)
      .where(
        and(
          eq(sessions.id, sessionId),
          eq(sessions.userId, authContext.user.id)
        )
      )
      .returning({ id: sessions.id });

    if (deletedSessions.length === 0) {
      return NextResponse.json(
        { error: "Session not found or you do not have permission to delete it" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Session terminated successfully" });
  } catch (error) {
    console.error("Delete session error:", error);
    return NextResponse.json(
      { error: "Failed to terminate session" },
      { status: 500 }
    );
  }
}