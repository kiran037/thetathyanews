///app/api/(auth)/signup/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword, logAudit } from "@/lib/auth";
import { storeOTP, sendOTPEmail } from "@/lib/otp";
import { validateData, signupSchema } from "@/lib/validation";
import { getClientInfo } from "@/lib/middleware";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { ipAddress, userAgent } = getClientInfo(req);

    // Validate input
    const validation = validateData(signupSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const { email, password, firstName, lastName } = validation.data;

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      if (existingUser[0].emailVerified) {
        return NextResponse.json(
          { error: "An account with this email already exists" },
          { status: 400 }
        );
      }

      // User exists but not verified, allow re-signup
      const passwordHash = await hashPassword(password);
      await db
        .update(users)
        .set({
          passwordHash,
          firstName: firstName || null,
          lastName: lastName || null,
          updatedAt: new Date(),
        })
        .where(eq(users.id, existingUser[0].id));

      // Generate and send OTP
      const { code } = await storeOTP(email, "signup");
      await sendOTPEmail(email, code, "signup");

      return NextResponse.json({
        message: "Verification code sent to your email",
        requiresVerification: true,
      });
    }

    // Create new user
    const passwordHash = await hashPassword(password);
    const [newUser] = await db
      .insert(users)
      .values({
        email,
        passwordHash,
        firstName: firstName || null,
        lastName: lastName || null,
        displayName: firstName
          ? `${firstName}${lastName ? " " + lastName : ""}`
          : null,
        status: "pending_verification",
        emailVerified: false,
      })
      .returning();

    // Generate and send OTP
    const { code } = await storeOTP(email, "signup");
    await sendOTPEmail(email, code, "signup");

    // Log audit
    await logAudit(
      newUser.id,
      "create",
      "users",
      newUser.id,
      { action: "signup" },
      ipAddress,
      userAgent
    );

    return NextResponse.json({
      message: "Account created! Please check your email for verification code",
      requiresVerification: true,
    });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "An error occurred during signup" },
      { status: 500 }
    );
  }
}