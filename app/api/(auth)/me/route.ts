// ///app/api/(auth)/me/route.ts
// import { NextRequest, NextResponse } from "next/server";
// import { verifySession, unauthorizedResponse, getUserRoles, getUserPermissions } from "@/lib/middleware";

// export async function GET(req: NextRequest) {
//   try {
//     const authContext = await verifySession(req);

//     if (!authContext) {
//       return unauthorizedResponse("Not authenticated");
//     }

//     // Get user roles and permissions
//     const roles = await getUserRoles(authContext.user.id);
//     const permissions = await getUserPermissions(authContext.user.id);

//     return NextResponse.json({
//       user: authContext.user,
//       roles,
//       permissions,
//     });
//   } catch (error) {
//     console.error("Get current user error:", error);
//     return NextResponse.json(
//       { error: "An error occurred" },
//       { status: 500 }
//     );
//   }
// }

// File: app/api/(auth)/me/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifySession, unauthorizedResponse, getUserRoles, getUserPermissions } from "@/lib/middleware";
import { db } from "@/db";
import { subscriptions, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const authContext = await verifySession(req);

    if (!authContext) {
      return unauthorizedResponse("Not authenticated");
    }

    const userId = authContext.user.id;

    // Parallelize data fetching for better performance
    const [roles, permissions, subscriptionData, fullUser] = await Promise.all([
      getUserRoles(userId),
      getUserPermissions(userId),
      db.select()
        .from(subscriptions)
        .where(eq(subscriptions.userId, userId))
        .orderBy(desc(subscriptions.endDate))
        .limit(1),
      db.select({
        avatarUrl: users.avatarUrl,
        displayName: users.displayName,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)
    ]);

    const activeSubscription = subscriptionData[0]?.status === 'active' ? subscriptionData[0] : null;

    return NextResponse.json({
      user: {
        ...authContext.user,
        ...fullUser[0], // ensure we get fresh profile data
      },
      roles,
      permissions,
      subscription: activeSubscription ? {
        planId: activeSubscription.planId,
        status: activeSubscription.status,
        expiresAt: activeSubscription.endDate
      } : null
    });
  } catch (error) {
    console.error("Get current user error:", error);
    return NextResponse.json(
      { error: "An error occurred fetching user profile" },
      { status: 500 }
    );
  }
}