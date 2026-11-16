// File: app/api/admin/users/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, userRoles, roles, userStatusEnum } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { verifySession, checkPermission } from "@/lib/middleware";
import { z } from "zod";

const patchUserSchema = z.object({
  userId: z.string().uuid("Invalid user ID"),
  status: z.enum(userStatusEnum.enumValues).optional(),
  roleSlug: z.enum(["admin", "editor", "writer", "reader"] as const).optional(),
});

export async function PATCH(request: NextRequest) {
  try {
    const authContext = await verifySession(request);
    if (!authContext) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const hasAccess = await checkPermission(authContext.user.id, "admin-access");
    if (!hasAccess) {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const body = await request.json();
    const validated = patchUserSchema.parse(body);

    // Guard: Admin cannot suspend themselves
    if (validated.userId === authContext.user.id && validated.status === "suspended") {
      return NextResponse.json({ error: "You cannot suspend your own admin account" }, { status: 400 });
    }

    // Update status if provided
    if (validated.status) {
      await db
        .update(users)
        .set({ status: validated.status, updatedAt: new Date() })
        .where(eq(users.id, validated.userId));
    }

    // Update role if provided
    if (validated.roleSlug) {
      const targetRole = await db.query.roles.findFirst({
        where: eq(roles.slug, validated.roleSlug),
      });

      if (!targetRole) {
        return NextResponse.json({ error: "Target role not found" }, { status: 400 });
      }

      // Remove existing roles
      await db
        .delete(userRoles)
        .where(eq(userRoles.userId, validated.userId));

      // Insert new role
      await db
        .insert(userRoles)
        .values({
          userId: validated.userId,
          roleId: targetRole.id,
          grantedBy: authContext.user.id,
        });
    }

    return NextResponse.json({ message: "User updated successfully" });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message || "Validation failed" }, { status: 400 });
    }
    console.error("Admin user update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
