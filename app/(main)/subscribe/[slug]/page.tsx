// File: app/(main)/subscribe/[slug]/page.tsx
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Check, ShieldCheck, ArrowLeft, Crown, Sparkles, Lock } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getSubscriptionPlanBySlug, getUserActiveSubscription } from "@/lib/data/subscriptions";
import { CheckoutButton } from "./checkout-client";

interface SubscribePlanPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata(props: SubscribePlanPageProps) {
  const { slug } = await props.params;
  const plan = await getSubscriptionPlanBySlug(slug);

  if (!plan) return { title: "Plan Not Found - TheTathyaNews" };

  return {
    title: `Subscribe to ${plan.name} - TheTathyaNews`,
    description: `Complete your subscription to ${plan.name} for unlimited satirical journalism.`,
  };
}

export default async function SubscribePlanPage(props: SubscribePlanPageProps) {
  const { slug } = await props.params;
  const plan = await getSubscriptionPlanBySlug(slug);

  if (!plan) {
    notFound();
  }

  // Free plan redirects to signup or home
  if (parseFloat(plan.price) === 0) {
    redirect("/pricing");
  }

  const user = await getCurrentUser();
  if (!user) {
    redirect(`/login?callbackUrl=/subscribe/${slug}`);
  }

  const activeSub = await getUserActiveSubscription(user.id);
  const isAlreadySubscribed = activeSub?.planSlug === plan.slug;
  const price = parseFloat(plan.price);
  const features = (plan.features as string[]) || [];

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-6">
      {/* Back Link */}
      <div>
        <Link
          href="/pricing"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Plans
        </Link>
      </div>

      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider">
          <Crown className="h-3.5 w-3.5" />
          Membership Checkout
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold">Complete Your Subscription</h1>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          Unlock unlimited satire, investigative vaults, and ad-free reading.
        </p>
      </div>

      {isAlreadySubscribed ? (
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center">
            <Check className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold">You are already subscribed to {plan.name}</h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Your active subscription is current. You can review your billing details or manage preferences in your account settings.
          </p>
          <div className="pt-2">
            <Link href="/account/subscription" className="btn-primary text-sm px-6 py-2.5 inline-block">
              Manage Subscription
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Order Summary Card */}
          <div className="md:col-span-3 rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-6 shadow-sm">
            <div className="border-b border-border pb-4">
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                Selected Plan
              </span>
              <h2 className="text-2xl font-bold mt-1">{plan.name}</h2>
              <p className="text-xs text-muted-foreground mt-1">{plan.description}</p>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase text-muted-foreground">What&apos;s Included</h3>
              <ul className="space-y-2.5">
                {features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm">
                    <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t border-border pt-4 flex items-center gap-2 text-xs text-muted-foreground">
              <Lock className="h-3.5 w-3.5 text-emerald-500" />
              <span>Encrypted 256-bit checkout · Cancel anytime without penalty</span>
            </div>
          </div>

          {/* Pricing & Checkout Action Card */}
          <div className="md:col-span-2 rounded-2xl border border-border bg-card p-6 space-y-6 flex flex-col justify-between shadow-sm">
            <div className="space-y-4">
              <h3 className="font-bold text-base border-b border-border pb-3">Billing Summary</h3>

              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Plan Price</span>
                  <span className="font-semibold">${price.toFixed(2)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Billing Cycle</span>
                  <span className="font-semibold capitalize">Per {plan.interval}</span>
                </div>

                {plan.trialDays && plan.trialDays > 0 ? (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                    <span>Free Trial Period</span>
                    <span className="font-semibold">{plan.trialDays} Days Free</span>
                  </div>
                ) : null}

                <div className="border-t border-border pt-3 flex justify-between text-base font-bold text-foreground">
                  <span>Due Today</span>
                  <span>{plan.trialDays && plan.trialDays > 0 ? "$0.00" : `$${price.toFixed(2)}`}</span>
                </div>
              </div>

              {plan.trialDays && plan.trialDays > 0 && (
                <p className="text-xs text-muted-foreground">
                  You won&apos;t be charged until your {plan.trialDays}-day trial concludes. Cancel anytime before trial ends.
                </p>
              )}
            </div>

            <div className="pt-4 space-y-3">
              <CheckoutButton
                planId={plan.id}
                planSlug={plan.slug}
                planName={plan.name}
              />
              <p className="text-[11px] text-center text-muted-foreground">
                By confirming, you authorize recurring charges per the terms of service.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
