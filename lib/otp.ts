import crypto from "crypto";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export type OTPPurpose = "signup" | "login" | "reset-password";

const OTP_EXPIRY = 10 * 60 * 1000; // 10 minutes
const OTP_LENGTH = 6;
export const MAX_OTP_ATTEMPTS = 5;

// Generate cryptographically secure OTP
export function generateOTP(): string {
  return crypto.randomInt(0, 999999).toString().padStart(OTP_LENGTH, "0");
}

// Store OTP in persistent database storage
export async function storeOTP(
  email: string,
  purpose: OTPPurpose
): Promise<{ code: string; expiresAt: Date }> {
  const code = generateOTP();
  const expiresAt = new Date(Date.now() + OTP_EXPIRY);
  const cleanEmail = email.toLowerCase().trim();

  // Retrieve existing user to preserve metadata
  const [existingUser] = await db
    .select({ id: users.id, metadata: users.metadata })
    .from(users)
    .where(eq(users.email, cleanEmail))
    .limit(1);

  const updatedMetadata = {
    ...((existingUser?.metadata as object) || {}),
    otpAttempts: 0,
    lastOtpGeneratedAt: new Date().toISOString(),
  };

  if (purpose === "signup" || purpose === "login") {
    await db
      .update(users)
      .set({
        emailVerificationToken: code,
        emailVerificationExpiry: expiresAt,
        metadata: updatedMetadata,
        updatedAt: new Date(),
      })
      .where(eq(users.email, cleanEmail));
  } else if (purpose === "reset-password") {
    await db
      .update(users)
      .set({
        passwordResetToken: code,
        passwordResetExpiry: expiresAt,
        metadata: updatedMetadata,
        updatedAt: new Date(),
      })
      .where(eq(users.email, cleanEmail));
  }

  return { code, expiresAt };
}

export interface VerifyOTPResult {
  success: boolean;
  error?: string;
  attemptsExceeded?: boolean;
}

// Verify OTP from persistent database storage with brute-force attempt lockout
export async function verifyOTP(
  email: string,
  code: string,
  purpose: OTPPurpose
): Promise<VerifyOTPResult> {
  const cleanEmail = email.toLowerCase().trim();
  const cleanCode = code.trim();

  const [user] = await db
    .select({
      id: users.id,
      metadata: users.metadata,
      emailVerificationToken: users.emailVerificationToken,
      emailVerificationExpiry: users.emailVerificationExpiry,
      passwordResetToken: users.passwordResetToken,
      passwordResetExpiry: users.passwordResetExpiry,
    })
    .from(users)
    .where(eq(users.email, cleanEmail))
    .limit(1);

  if (!user) {
    return { success: false, error: "Invalid request or account not found" };
  }

  const userMeta = (user.metadata as Record<string, any>) || {};
  const currentAttempts = typeof userMeta.otpAttempts === "number" ? userMeta.otpAttempts : 0;

  // Check if previous attempts already exceeded threshold
  if (currentAttempts >= MAX_OTP_ATTEMPTS) {
    return {
      success: false,
      attemptsExceeded: true,
      error: "Too many failed attempts. This verification code has been invalidated. Please request a new code.",
    };
  }

  const now = new Date();

  // 1. Check signup/login token
  if (purpose === "signup" || purpose === "login") {
    if (!user.emailVerificationToken || !user.emailVerificationExpiry) {
      return { success: false, error: "No active verification code found. Please request a new code." };
    }

    if (now > user.emailVerificationExpiry) {
      await db
        .update(users)
        .set({
          emailVerificationToken: null,
          emailVerificationExpiry: null,
          metadata: { ...userMeta, otpAttempts: 0 },
        })
        .where(eq(users.id, user.id));
      return { success: false, error: "Verification code has expired. Please request a new code." };
    }

    if (user.emailVerificationToken !== cleanCode) {
      const newAttempts = currentAttempts + 1;
      const isLocked = newAttempts >= MAX_OTP_ATTEMPTS;

      await db
        .update(users)
        .set({
          ...(isLocked && {
            emailVerificationToken: null,
            emailVerificationExpiry: null,
          }),
          metadata: {
            ...userMeta,
            otpAttempts: newAttempts,
            lastFailedAttemptAt: now.toISOString(),
          },
        })
        .where(eq(users.id, user.id));

      if (isLocked) {
        return {
          success: false,
          attemptsExceeded: true,
          error: "Maximum verification attempts exceeded. Code has been invalidated. Please request a new code.",
        };
      }

      const remaining = MAX_OTP_ATTEMPTS - newAttempts;
      return {
        success: false,
        error: `Invalid verification code. ${remaining} attempt${remaining === 1 ? "" : "s"} remaining.`,
      };
    }

    // OTP is valid - clear immediately to guarantee one-time use and reset attempts
    await db
      .update(users)
      .set({
        emailVerificationToken: null,
        emailVerificationExpiry: null,
        metadata: { ...userMeta, otpAttempts: 0 },
      })
      .where(eq(users.id, user.id));

    return { success: true };
  }

  // 2. Check reset-password token
  if (purpose === "reset-password") {
    if (!user.passwordResetToken || !user.passwordResetExpiry) {
      return { success: false, error: "No active password reset code found. Please request a new code." };
    }

    if (now > user.passwordResetExpiry) {
      await db
        .update(users)
        .set({
          passwordResetToken: null,
          passwordResetExpiry: null,
          metadata: { ...userMeta, otpAttempts: 0 },
        })
        .where(eq(users.id, user.id));
      return { success: false, error: "Password reset code has expired. Please request a new code." };
    }

    if (user.passwordResetToken !== cleanCode) {
      const newAttempts = currentAttempts + 1;
      const isLocked = newAttempts >= MAX_OTP_ATTEMPTS;

      await db
        .update(users)
        .set({
          ...(isLocked && {
            passwordResetToken: null,
            passwordResetExpiry: null,
          }),
          metadata: {
            ...userMeta,
            otpAttempts: newAttempts,
            lastFailedAttemptAt: now.toISOString(),
          },
        })
        .where(eq(users.id, user.id));

      if (isLocked) {
        return {
          success: false,
          attemptsExceeded: true,
          error: "Maximum reset attempts exceeded. Code has been invalidated. Please request a new code.",
        };
      }

      const remaining = MAX_OTP_ATTEMPTS - newAttempts;
      return {
        success: false,
        error: `Invalid reset code. ${remaining} attempt${remaining === 1 ? "" : "s"} remaining.`,
      };
    }

    // OTP is valid - clear immediately to guarantee one-time use and reset attempts
    await db
      .update(users)
      .set({
        passwordResetToken: null,
        passwordResetExpiry: null,
        metadata: { ...userMeta, otpAttempts: 0 },
      })
      .where(eq(users.id, user.id));

    return { success: true };
  }

  return { success: false, error: "Invalid verification purpose" };
}

// Send OTP via email (Brevo in production, mock log in development without exposing code)
export async function sendOTPEmail(
  email: string,
  code: string,
  purpose: OTPPurpose
): Promise<void> {
  // Development: Log notice to console without logging the plaintext secret
  if (process.env.NODE_ENV !== "production") {
    console.log(`[AUTH OTP] Dispatched verification email for: ${email} | Purpose: ${purpose}`);
    return;
  }

  // Production: Use Brevo API
  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": process.env.BREVO_API_KEY || "",
      },
      body: JSON.stringify({
        sender: {
          name: process.env.BREVO_SENDER_NAME || "TheTathyaNews",
          email: process.env.BREVO_SENDER_EMAIL || "noreply@thetathyanews.com",
        },
        to: [{ email }],
        subject: getEmailSubject(purpose),
        htmlContent: getEmailTemplate(code, purpose),
      }),
    });

    if (!response.ok) {
      console.error(`Failed to send email via Brevo: ${response.statusText}`);
    }
  } catch (error) {
    console.error("Error sending OTP email:", error);
  }
}

function getEmailSubject(purpose: OTPPurpose): string {
  switch (purpose) {
    case "signup":
      return "Verify your email - TheTathyaNews";
    case "reset-password":
      return "Reset your password - TheTathyaNews";
    case "login":
      return "Your login verification code - TheTathyaNews";
  }
}

function getEmailTemplate(code: string, purpose: OTPPurpose): string {
  const titles = {
    signup: "Verify Your Email Address",
    "reset-password": "Reset Your Password",
    login: "Login Verification Code",
  };

  const descriptions = {
    signup: "Welcome to TheTathyaNews! Please use the verification code below to confirm your account:",
    "reset-password": "We received a request to reset your password. Use the verification code below to proceed:",
    login: "Use the verification code below to complete your login:",
  };

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; padding-bottom: 20px; border-bottom: 1px solid #eee; }
          .logo { font-size: 24px; font-weight: bold; color: #e11d48; text-decoration: none; }
          .content { padding: 30px 0; }
          .otp-box { background-color: #f4f4f5; border-radius: 8px; padding: 20px; text-align: center; margin: 25px 0; }
          .otp-code { font-size: 36px; font-weight: bold; letter-spacing: 6px; color: #18181b; font-family: monospace; }
          .footer { text-align: center; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #71717a; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://thetathyanews.com"}" class="logo">TheTathyaNews</a>
          </div>
          <div class="content">
            <h2>${titles[purpose]}</h2>
            <p>${descriptions[purpose]}</p>
            <div class="otp-box">
              <div class="otp-code">${code}</div>
            </div>
            <p>This code will expire in <strong>10 minutes</strong>. If you did not make this request, you can safely ignore this email.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} TheTathyaNews. All rights reserved.</p>
            <p>Independent Satirical Journalism</p>
          </div>
        </div>
      </body>
    </html>
  `;
}