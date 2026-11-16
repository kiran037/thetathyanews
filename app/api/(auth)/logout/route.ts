///app/api/(auth)/logout/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  getSessionToken,
  invalidateSession,
  clearSessionCookie,
  logAudit,
} from "@/lib/auth";
import { verifySession, getClientInfo } from "@/lib/middleware";

export async function POST(req: NextRequest) {
  try {
    const { ipAddress, userAgent } = getClientInfo(req);
    const token = await getSessionToken();

    if (!token) {
      return NextResponse.json(
        { error: "No active session" },
        { status: 400 }
      );
    }

    // Verify session to get user ID
    const authContext = await verifySession(req);
    
    // Invalidate session
    await invalidateSession(token);
    await clearSessionCookie();

    // Log audit
    if (authContext) {
      await logAudit(
        authContext.user.id,
        "logout",
        "users",
        authContext.user.id,
        null,
        ipAddress,
        userAgent
      );
    }

    return NextResponse.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "An error occurred during logout" },
      { status: 500 }
    );
  }
}