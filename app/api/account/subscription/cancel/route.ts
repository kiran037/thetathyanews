// File: app/api/account/subscription/cancel/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { subscriptions } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { verifySession } from "@/lib/middleware";
import { z } from "zod";

const cancelSchema = z.object({
  subscriptionId: z.string().uuid("Invalid subscription ID"),
});

export async function POST(request: NextRequest) {
  try {
    const authContext = await verifySession(request);
    if (!authContext) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validated = cancelSchema.parse(body);

    // Verify ownership
    const sub = await db.query.subscriptions.findFirst({
      where: and(
        eq(subscriptions.id, validated.subscriptionId),
        eq(subscriptions.userId, authContext.user.id)
      ),
    });

    if (!sub) {
      return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
    }

    await db
      .update(subscriptions)
      .set({
        autoRenew: false,
        canceledAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.id, sub.id));

    return NextResponse.json({ message: "Subscription scheduled for cancellation" });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message || "Validation failed" }, { status: 400 });
    }
    console.error("Subscription cancel error:", error);
    return NextResponse.json({ error: "Failed to cancel subscription" }, { status: 500 });
  }
}
