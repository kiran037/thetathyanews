///app/api/(auth)/verify-email/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, roles, userRoles } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  createSession,
  setSessionCookie,
  resetLoginAttempts,
  logAudit,
} from "@/lib/auth";
import { verifyOTP } from "@/lib/otp";
import { validateData, verifyEmailSchema } from "@/lib/validation";
import { getClientInfo } from "@/lib/middleware";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { ipAddress, userAgent } = getClientInfo(req);

    // Validate input
    const validation = validateData(verifyEmailSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const { email, otp } = validation.data;

    // Verify OTP with attempt lockout
    const otpResult = await verifyOTP(email, otp, "signup");
    if (!otpResult.success) {
      return NextResponse.json(
        { error: otpResult.error || "Invalid or expired verification code" },
        { status: otpResult.attemptsExceeded ? 429 : 400 }
      );
    }

    // Get user
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { error: "Email already verified" },
        { status: 400 }
      );
    }

    // Update user
    await db
      .update(users)
      .set({
        emailVerified: true,
        status: "active",
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    // Assign default role
    const [defaultRole] = await db
      .select()
      .from(roles)
      .where(eq(roles.isDefault, true))
      .limit(1);

    if (defaultRole) {
      await db.insert(userRoles).values({
        userId: user.id,
        roleId: defaultRole.id,
      });
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
      "update",
      "users",
      user.id,
      { action: "email_verified" },
      ipAddress,
      userAgent
    );

    return NextResponse.json({
      message: "Email verified successfully",
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        displayName: user.displayName,
      },
    });
  } catch (error) {
    console.error("Email verification error:", error);
    return NextResponse.json(
      { error: "An error occurred during verification" },
      { status: 500 }
    );
  }
}