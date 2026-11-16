// File: lib/data/subscriptions.ts
import { db } from "@/db";
import { subscriptionPlans, subscriptions, payments } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";

export async function getSubscriptionPlans() {
  return await db
    .select()
    .from(subscriptionPlans)
    .where(eq(subscriptionPlans.isActive, true))
    .orderBy(subscriptionPlans.displayOrder);
}

export async function getSubscriptionPlanBySlug(slug: string) {
  const [plan] = await db
    .select()
    .from(subscriptionPlans)
    .where(and(eq(subscriptionPlans.slug, slug), eq(subscriptionPlans.isActive, true)))
    .limit(1);

  return plan || null;
}

export async function getUserActiveSubscription(userId: string) {
  const userSubs = await db
    .select({
      id: subscriptions.id,
      status: subscriptions.status,
      currentPeriodStart: subscriptions.currentPeriodStart,
      currentPeriodEnd: subscriptions.currentPeriodEnd,
      autoRenew: subscriptions.autoRenew,
      planId: subscriptions.planId,
      planName: subscriptionPlans.name,
      planSlug: subscriptionPlans.slug,
      price: subscriptionPlans.price,
      currency: subscriptionPlans.currency,
      interval: subscriptionPlans.interval,
      features: subscriptionPlans.features,
    })
    .from(subscriptions)
    .innerJoin(subscriptionPlans, eq(subscriptions.planId, subscriptionPlans.id))
    .where(
      and(
        eq(subscriptions.userId, userId),
        eq(subscriptions.status, "active")
      )
    )
    .limit(1);

  return userSubs[0] || null;
}

export async function getUserPayments(userId: string) {
  return await db
    .select()
    .from(payments)
    .where(eq(payments.userId, userId))
    .orderBy(desc(payments.createdAt))
    .limit(20);
}
