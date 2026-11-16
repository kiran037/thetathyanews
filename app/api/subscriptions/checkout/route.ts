// File: app/api/subscriptions/checkout/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { subscriptionPlans, subscriptions, payments } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { verifySession } from "@/lib/middleware";
import { z } from "zod";

const checkoutSchema = z.object({
  planId: z.string().uuid("Invalid plan ID").optional(),
  planSlug: z.string().min(1, "Plan slug required"),
});

export async function POST(request: NextRequest) {
  try {
    const authContext = await verifySession(request);
    if (!authContext) {
      return NextResponse.json({ error: "Authentication required to subscribe" }, { status: 401 });
    }

    const body = await request.json();
    const validated = checkoutSchema.parse(body);

    // Fetch authoritative plan from DB
    const plan = await db.query.subscriptionPlans.findFirst({
      where: and(
        eq(subscriptionPlans.slug, validated.planSlug),
        eq(subscriptionPlans.isActive, true)
      ),
    });

    if (!plan) {
      return NextResponse.json({ error: "Selected plan does not exist or is inactive" }, { status: 404 });
    }

    // Determine period dates
    const now = new Date();
    const periodEnd = new Date(now);
    if (plan.interval === "year") {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    } else {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    }

    const trialDays = plan.trialDays || 0;
    const trialEnd = trialDays > 0 ? new Date(now.getTime() + trialDays * 86400000) : null;

    // Check if user already has an active subscription
    const existingSub = await db.query.subscriptions.findFirst({
      where: and(
        eq(subscriptions.userId, authContext.user.id),
        eq(subscriptions.status, "active")
      ),
    });

    let activeSubId: string;

    if (existingSub) {
      // Upgrade / change existing subscription plan
      const [updated] = await db
        .update(subscriptions)
        .set({
          planId: plan.id,
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
          autoRenew: true,
          updatedAt: now,
        })
        .where(eq(subscriptions.id, existingSub.id))
        .returning();
      activeSubId = updated.id;
    } else {
      // Create new subscription record
      const [newSub] = await db
        .insert(subscriptions)
        .values({
          userId: authContext.user.id,
          planId: plan.id,
          status: "active",
          startDate: now,
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
          trialStartDate: trialDays > 0 ? now : null,
          trialEndDate: trialEnd,
          autoRenew: true,
        })
        .returning();
      activeSubId = newSub.id;
    }

    // Record payment audit trail
    await db
      .insert(payments)
      .values({
        userId: authContext.user.id,
        subscriptionId: activeSubId,
        amount: plan.price,
        currency: plan.currency || "USD",
        status: "succeeded",
        paymentMethod: "card",
      });

    return NextResponse.json({
      message: "Subscription activated successfully",
      url: `/subscribe/success?plan=${plan.slug}&session_id=${activeSubId}`,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message || "Validation failed" }, { status: 400 });
    }
    console.error("Subscription checkout error:", error);
    return NextResponse.json({ error: "Failed to process checkout" }, { status: 500 });
  }
}
