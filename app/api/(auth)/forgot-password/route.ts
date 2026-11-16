///app/api/(auth)/forgot-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { storeOTP, sendOTPEmail } from "@/lib/otp";
import { validateData, forgotPasswordSchema } from "@/lib/validation";
import { logAudit } from "@/lib/auth";
import { getClientInfo } from "@/lib/middleware";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { ipAddress, userAgent } = getClientInfo(req);

    // Validate input
    const validation = validateData(forgotPasswordSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const { email } = validation.data;

    // Check if user exists
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({
        message: "If an account exists, a reset code has been sent to your email",
      });
    }

    // Check if email is verified
    if (!user.emailVerified) {
      return NextResponse.json(
        { error: "Please verify your email first" },
        { status: 400 }
      );
    }

    // Generate and send OTP
    const { code } = await storeOTP(email, "reset-password");
    await sendOTPEmail(email, code, "reset-password");

    // Log audit
    await logAudit(
      user.id,
      "update",
      "users",
      user.id,
      { action: "password_reset_requested" },
      ipAddress,
      userAgent
    );

    return NextResponse.json({
      message: "If an account exists, a reset code has been sent to your email",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "An error occurred" },
      { status: 500 }
    );
  }
}