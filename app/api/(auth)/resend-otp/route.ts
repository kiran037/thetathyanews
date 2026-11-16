///app/api/(auth)/resend-otp/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { storeOTP, sendOTPEmail } from "@/lib/otp";
import { validateData, resendOTPSchema } from "@/lib/validation";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate input
    const validation = validateData(resendOTPSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const { email, purpose } = validation.data;

    // Check if user exists
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

    // For signup OTP, check if already verified
    if (purpose === "signup" && user.emailVerified) {
      return NextResponse.json(
        { error: "Email already verified" },
        { status: 400 }
      );
    }

    // For reset-password, check if email is verified
    if (purpose === "reset-password" && !user.emailVerified) {
      return NextResponse.json(
        { error: "Please verify your email first" },
        { status: 400 }
      );
    }

    // Check 60-second cooldown from metadata
    const userMeta = (user.metadata as Record<string, any>) || {};
    const lastGeneratedAt = userMeta.lastOtpGeneratedAt ? new Date(userMeta.lastOtpGeneratedAt).getTime() : 0;
    const cooldownMs = 60 * 1000;
    const elapsed = Date.now() - lastGeneratedAt;

    if (elapsed < cooldownMs) {
      const remainingSeconds = Math.ceil((cooldownMs - elapsed) / 1000);
      return NextResponse.json(
        { error: `Please wait ${remainingSeconds} seconds before requesting a new code.` },
        { status: 429 }
      );
    }

    // Generate and send new OTP
    const { code } = await storeOTP(email, purpose);
    await sendOTPEmail(email, code, purpose);

    return NextResponse.json({
      message: "Verification code sent successfully",
    });
  } catch (error) {
    console.error("Resend OTP error:", error);
    return NextResponse.json(
      { error: "An error occurred while sending code" },
      { status: 500 }
    );
  }
}