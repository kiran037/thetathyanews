///app/api/(auth)/reset-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, sessions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword, logAudit } from "@/lib/auth";
import { verifyOTP } from "@/lib/otp";
import { validateData, resetPasswordSchema } from "@/lib/validation";
import { getClientInfo } from "@/lib/middleware";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { ipAddress, userAgent } = getClientInfo(req);

    // Validate input
    const validation = validateData(resetPasswordSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const { email, otp, newPassword } = validation.data;

    // Verify OTP with attempt lockout
    const otpResult = await verifyOTP(email, otp, "reset-password");
    if (!otpResult.success) {
      return NextResponse.json(
        { error: otpResult.error || "Invalid or expired reset code" },
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

    // Update password
    const passwordHash = await hashPassword(newPassword);
    await db
      .update(users)
      .set({
        passwordHash,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    // Invalidate all user sessions for security
    await db.delete(sessions).where(eq(sessions.userId, user.id));

    // Log audit
    await logAudit(
      user.id,
      "password_change",
      "users",
      user.id,
      { method: "reset" },
      ipAddress,
      userAgent
    );

    return NextResponse.json({
      message: "Password reset successfully. Please log in with your new password.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "An error occurred during password reset" },
      { status: 500 }
    );
  }
}