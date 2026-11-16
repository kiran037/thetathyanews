///app/api/(auth)/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  verifyPassword,
  createSession,
  setSessionCookie,
  checkLoginAttempts,
  recordFailedLogin,
  resetLoginAttempts,
  logAudit,
} from "@/lib/auth";
import { validateData, loginSchema } from "@/lib/validation";
import { getClientInfo } from "@/lib/middleware";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { ipAddress, userAgent } = getClientInfo(req);

    // Validate input
    const validation = validateData(loginSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const { email, password } = validation.data;

    // Check login attempts
    const canAttempt = await checkLoginAttempts(email);
    if (!canAttempt) {
      return NextResponse.json(
        { error: "Account temporarily locked. Please try again later." },
        { status: 429 }
      );
    }

    // Get user
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user || !user.passwordHash) {
      await recordFailedLogin(email);
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.passwordHash);
    if (!isValidPassword) {
      await recordFailedLogin(email);
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Check if email is verified
    if (!user.emailVerified) {
      return NextResponse.json(
        { error: "Please verify your email first", requiresVerification: true },
        { status: 403 }
      );
    }

    // Check user status
    if (user.status === "suspended") {
      return NextResponse.json(
        { error: "Your account has been suspended" },
        { status: 403 }
      );
    }

    if (user.status === "banned") {
      return NextResponse.json(
        { error: "Your account has been banned" },
        { status: 403 }
      );
    }

    // Create session
    const session = await createSession(user.id, ipAddress, userAgent);
    await setSessionCookie(session.token);

    // Reset login attempts
    await resetLoginAttempts(user.id);

    // Update last login
    await db
      .update(users)
      .set({
        lastLoginAt: new Date(),
        lastLoginIp: ipAddress,
        loginCount: (user.loginCount || 0) + 1,
      })
      .where(eq(users.id, user.id));

    // Log audit
    await logAudit(
      user.id,
      "login",
      "users",
      user.id,
      { method: "password" },
      ipAddress,
      userAgent
    );

    return NextResponse.json({
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        status: user.status,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "An error occurred during login" },
      { status: 500 }
    );
  }
}