///lib/middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  users,
  sessions,
  userRoles,
  roles,
  rolePermissions,
  permissions,
  userPermissions,
} from "@/db/schema";
import { eq, and, gt, or } from "drizzle-orm";

export interface AuthContext {
  user: {
    id: string;
    email: string;
    status: string;
    emailVerified: boolean | null;
  };
  session: {
    id: string;
    token: string;
  };
}

// Get client IP and user agent
export function getClientInfo(req: NextRequest) {
  const ipAddress = 
    req.headers.get("x-forwarded-for")?.split(",")[0] ||
    req.headers.get("x-real-ip") ||
    "unknown";
  const userAgent = req.headers.get("user-agent") || "unknown";
  
  return { ipAddress, userAgent };
}

// Verify session from request
export async function verifySession(
  req: NextRequest
): Promise<AuthContext | null> {
  const token = req.cookies.get("session_token")?.value;
  if (!token) return null;

  const [session] = await db
    .select()
    .from(sessions)
    .where(
      and(eq(sessions.token, token), gt(sessions.expiresAt, new Date()))
    )
    .limit(1);

  if (!session) return null;

  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
      status: users.status,
      emailVerified: users.emailVerified,
    })
    .from(users)
    .where(eq(users.id, session.userId))
    .limit(1);

  if (!user) return null;

  return {
    user,
    session: {
      id: session.id,
      token: session.token,
    },
  };
}

// Check if user has permission
export async function checkPermission(
  userId: string,
  permissionSlug: string
): Promise<boolean> {
  // Get user's direct permissions
  const directPermissions = await db
    .select({ slug: permissions.slug })
    .from(userPermissions)
    .innerJoin(permissions, eq(userPermissions.permissionId, permissions.id))
    .where(eq(userPermissions.userId, userId));

  // Filter out expired permissions in application logic
  const validDirectPermissions = directPermissions.filter((p) => {
    const expiresAt = (p as any).expiresAt;
    return !expiresAt || new Date(expiresAt) > new Date();
  });

  if (validDirectPermissions.some((p) => p.slug === permissionSlug)) {
    return true;
  }

  // Get permissions through roles
  const roleBasedPermissions = await db
    .select({ slug: permissions.slug })
    .from(userRoles)
    .innerJoin(roles, eq(userRoles.roleId, roles.id))
    .innerJoin(rolePermissions, eq(roles.id, rolePermissions.roleId))
    .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
    .where(eq(userRoles.userId, userId));

  // Filter out expired role assignments in application logic
  const validRolePermissions = roleBasedPermissions.filter((p) => {
    const expiresAt = (p as any).expiresAt;
    return !expiresAt || new Date(expiresAt) > new Date();
  });

  return validRolePermissions.some((p) => p.slug === permissionSlug);
}

// Check if user has role
export async function checkRole(
  userId: string,
  roleSlug: string
): Promise<boolean> {
  const userRole = await db
    .select({ slug: roles.slug, expiresAt: userRoles.expiresAt })
    .from(userRoles)
    .innerJoin(roles, eq(userRoles.roleId, roles.id))
    .where(
      and(
        eq(userRoles.userId, userId),
        eq(roles.slug, roleSlug)
      )
    )
    .limit(1);

  if (userRole.length === 0) return false;

  // Check expiration in application logic
  const expiresAt = userRole[0].expiresAt;
  if (expiresAt && new Date(expiresAt) <= new Date()) {
    return false;
  }

  return true;
}

// Get user roles
export async function getUserRoles(userId: string): Promise<string[]> {
  const userRolesList = await db
    .select({ slug: roles.slug, expiresAt: userRoles.expiresAt })
    .from(userRoles)
    .innerJoin(roles, eq(userRoles.roleId, roles.id))
    .where(eq(userRoles.userId, userId));

  // Filter out expired roles in application logic
  const validRoles = userRolesList.filter((r) => {
    const expiresAt = r.expiresAt;
    return !expiresAt || new Date(expiresAt) > new Date();
  });

  return validRoles.map((r) => r.slug);
}

// Get user permissions
export async function getUserPermissions(userId: string): Promise<string[]> {
  // Direct permissions
  const direct = await db
    .select({ slug: permissions.slug, expiresAt: userPermissions.expiresAt })
    .from(userPermissions)
    .innerJoin(permissions, eq(userPermissions.permissionId, permissions.id))
    .where(eq(userPermissions.userId, userId));

  // Filter out expired permissions
  const validDirectPermissions = direct.filter((p) => {
    const expiresAt = p.expiresAt;
    return !expiresAt || new Date(expiresAt) > new Date();
  });

  // Role-based permissions
  const roleBased = await db
    .select({ 
      slug: permissions.slug, 
      expiresAt: userRoles.expiresAt 
    })
    .from(userRoles)
    .innerJoin(rolePermissions, eq(userRoles.roleId, rolePermissions.roleId))
    .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
    .where(eq(userRoles.userId, userId));

  // Filter out expired role assignments
  const validRolePermissions = roleBased.filter((p) => {
    const expiresAt = p.expiresAt;
    return !expiresAt || new Date(expiresAt) > new Date();
  });

  const allPermissions = [
    ...validDirectPermissions.map(p => p.slug),
    ...validRolePermissions.map(p => p.slug)
  ];
  
  return [...new Set(allPermissions)];
}

// Error response helpers
export function unauthorizedResponse(message = "Unauthorized") {
  return NextResponse.json({ error: message }, { status: 401 });
}

export function forbiddenResponse(message = "Forbidden") {
  return NextResponse.json({ error: message }, { status: 403 });
}

export function badRequestResponse(message = "Bad request") {
  return NextResponse.json({ error: message }, { status: 400 });
}