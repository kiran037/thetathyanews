// File: app/(main)/subscribe/success/page.tsx
import Link from "next/link";
import { CheckCircle2, Crown, BookOpen, ArrowRight, ShieldCheck } from "lucide-react";
import { getSubscriptionPlanBySlug } from "@/lib/data/subscriptions";

interface SuccessPageProps {
  searchParams: Promise<{
    plan?: string;
    session_id?: string;
  }>;
}

export const metadata = {
  title: "Subscription Confirmed - TheTathyaNews",
  description: "Welcome to TheTathyaNews Pro membership.",
};

export default async function SubscribeSuccessPage(props: SuccessPageProps) {
  const searchParams = await props.searchParams;
  const planSlug = searchParams.plan || "pro-monthly";
  const plan = await getSubscriptionPlanBySlug(planSlug);

  return (
    <div className="max-w-xl mx-auto py-12 px-4 text-center space-y-6">
      <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
        <CheckCircle2 className="h-8 w-8" />
      </div>

      <div className="space-y-2">
        <span className="text-xs font-semibold text-primary uppercase tracking-wider">
          Payment Confirmed
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold">
          Welcome to {plan?.name || "TheTathyaNews Pro"}!
        </h1>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          Your membership is now active. You have unlocked unlimited access to the entire satirical archive, exclusive investigative pieces, and an ad-free reading experience.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 text-left space-y-3 shadow-sm">
        <div className="flex justify-between items-center text-sm border-b border-border pb-3">
          <span className="text-muted-foreground">Membership Plan</span>
          <span className="font-semibold text-foreground">{plan?.name || "Pro Membership"}</span>
        </div>
        <div className="flex justify-between items-center text-sm border-b border-border pb-3">
          <span className="text-muted-foreground">Account Status</span>
          <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="h-4 w-4" />
            Active
          </span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">Billing Interval</span>
          <span className="font-semibold text-foreground capitalize">Every {plan?.interval || "month"}</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
        <Link href="/" className="btn-primary px-6 py-2.5 text-sm inline-flex items-center justify-center gap-2">
          <BookOpen className="h-4 w-4" />
          Start Reading Satire
        </Link>
        <Link href="/account/subscription" className="btn-secondary px-6 py-2.5 text-sm inline-flex items-center justify-center gap-2">
          Manage Account
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
