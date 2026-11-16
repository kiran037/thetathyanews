///lib/auth-server.ts
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { checkPermission, checkRole } from "@/lib/middleware";

/**
 * Server component helper to require authentication
 * Use in page.tsx or layout.tsx: await requireAuth()
 */
export async function requireAuth() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect("/login");
  }

  if (!user.emailVerified) {
    redirect("/verify-email");
  }

  if (user.status !== "active") {
    redirect("/account-suspended");
  }

  return user;
}

/**
 * Server component helper to require admin access
 * Use in admin pages: await requireAdmin()
 */
export async function requireAdmin() {
  const user = await requireAuth();
  
  const hasAccess = await checkPermission(user.id, "admin-access");
  
  if (!hasAccess) {
    redirect("/");
  }

  return user;
}

/**
 * Server component helper to require specific permission
 * Use in pages: await requirePermission("articles-create")
 */
export async function requirePermission(permissionSlug: string) {
  const user = await requireAuth();
  
  const hasPermission = await checkPermission(user.id, permissionSlug);
  
  if (!hasPermission) {
    redirect("/");
  }

  return user;
}

/**
 * Server component helper to require specific role
 * Use in pages: await requireRole("editor")
 */
export async function requireRole(roleSlug: string) {
  const user = await requireAuth();
  
  const hasRole = await checkRole(user.id, roleSlug);
  
  if (!hasRole) {
    redirect("/");
  }

  return user;
}

/**
 * Server component helper to get current user (optional)
 * Returns null if not authenticated
 */
export async function getAuth() {
  const user = await getCurrentUser();
  return user;
}