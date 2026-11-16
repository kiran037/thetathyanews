///lib/auth.ts
import { db } from "@/db";
import { users, sessions, auditLogs } from "@/db/schema";
import { eq, and, gt } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import { cookies } from "next/headers";

// Types
export interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  status: string;
  emailVerified: boolean | null;
}

export interface Session {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
}

// Constants
const SESSION_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days
const SESSION_COOKIE_NAME = "session_token";
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

// Password utilities
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Session management
export async function createSession(
  userId: string,
  ipAddress?: string,
  userAgent?: string
): Promise<Session> {
  const token = nanoid(64);
  const expiresAt = new Date(Date.now() + SESSION_DURATION);

  const [session] = await db
    .insert(sessions)
    .values({
      userId,
      token,
      expiresAt,
      ipAddress,
      userAgent,
      lastActivityAt: new Date(),
    })
    .returning();

  return session;
}

export async function getSessionByToken(
  token: string
): Promise<Session | null> {
  const [session] = await db
    .select()
    .from(sessions)
    .where(
      and(eq(sessions.token, token), gt(sessions.expiresAt, new Date()))
    )
    .limit(1);

  return session || null;
}

export async function invalidateSession(token: string): Promise<void> {
  await db.delete(sessions).where(eq(sessions.token, token));
}

export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_DURATION / 1000,
    path: "/",
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function getSessionToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value || null;
}

// User utilities
export async function getUserById(userId: string): Promise<User | null> {
  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      displayName: users.displayName,
      avatarUrl: users.avatarUrl,
      status: users.status,
      emailVerified: users.emailVerified,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return user || null;
}

export async function getUserByEmail(email: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email.toLowerCase()))
    .limit(1);

  return user || null;
}

// Current user from session
export async function getCurrentUser(): Promise<User | null> {
  const token = await getSessionToken();
  if (!token) return null;

  const session = await getSessionByToken(token);
  if (!session) {
    await clearSessionCookie();
    return null;
  }

  return getUserById(session.userId);
}

// Login attempt tracking
export async function checkLoginAttempts(email: string): Promise<boolean> {
  const user = await getUserByEmail(email);
  if (!user) return true; // Allow attempt if user doesn't exist

  if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
    return false; // Account is locked
  }

  return true;
}

export async function recordFailedLogin(email: string): Promise<void> {
  const user = await getUserByEmail(email);
  if (!user) return;

  const attempts = (user.failedLoginAttempts || 0) + 1;
  const lockedUntil =
    attempts >= MAX_LOGIN_ATTEMPTS
      ? new Date(Date.now() + LOCKOUT_DURATION)
      : null;

  await db
    .update(users)
    .set({
      failedLoginAttempts: attempts,
      lockedUntil,
      updatedAt: new Date(),
    })
    .where(eq(users.id, user.id));
}

export async function resetLoginAttempts(userId: string): Promise<void> {
  await db
    .update(users)
    .set({
      failedLoginAttempts: 0,
      lockedUntil: null,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));
}

// Audit logging
export async function logAudit(
  userId: string | null,
  action: string,
  resource?: string,
  resourceId?: string,
  metadata?: any,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  await db.insert(auditLogs).values({
    userId,
    action: action as any,
    resource,
    resourceId,
    metadata,
    ipAddress,
    userAgent,
    timestamp: new Date(),
  });
}