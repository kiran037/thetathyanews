// File: app/(main)/account/subscription/page.tsx
import { redirect } from "next/navigation";
import Link from "next/link";
import { CreditCard, Check, Crown, ShieldAlert, Sparkles, AlertCircle, ArrowRight } from "lucide-react";
import { requireAuth } from "@/lib/auth-server";
import { getUserActiveSubscription, getUserPayments } from "@/lib/data/subscriptions";
import { CancelSubscriptionButton } from "./cancel-client";

export const metadata = {
  title: "My Subscription - TheTathyaNews",
  description: "Manage your active membership, billing details, and receipts.",
};

export default async function AccountSubscriptionPage() {
  const user = await requireAuth();
  const [activeSub, payments] = await Promise.all([
    getUserActiveSubscription(user.id),
    getUserPayments(user.id),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Subscription & Billing</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Review your current membership tier, renewal date, and transaction receipts
        </p>
      </div>

      {activeSub ? (
        <div className="rounded-xl border border-border bg-card p-6 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Crown className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold">{activeSub.planName}</h2>
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 capitalize">
                    {activeSub.status}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  ${parseFloat(activeSub.price).toFixed(2)} / {activeSub.interval}
                </p>
              </div>
            </div>

            <div className="text-sm">
              <p className="text-xs text-muted-foreground">Current Billing Period</p>
              <p className="font-semibold text-foreground">
                Renews on {new Date(activeSub.currentPeriodEnd).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase text-muted-foreground">Active Benefits</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              {((activeSub.features as string[]) || []).map((f, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary flex-shrink-0" />
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-border pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="text-xs text-muted-foreground">
              {activeSub.autoRenew === false ? (
                <span className="text-amber-600 dark:text-amber-400 font-medium">
                  Your subscription is scheduled to end on {new Date(activeSub.currentPeriodEnd).toLocaleDateString()}.
                </span>
              ) : (
                <span>Need to adjust or pause your membership?</span>
              )}
            </div>

            {activeSub.autoRenew !== false && (
              <CancelSubscriptionButton subscriptionId={activeSub.id} />
            )}
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card p-6 sm:p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-muted text-muted-foreground mx-auto flex items-center justify-center">
            <Sparkles className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold">Standard Free Tier</h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              You are currently on our free ad-supported plan. Upgrade to Pro for an ad-free experience, full library tools, and exclusive satirical investigations.
            </p>
          </div>
          <div className="pt-2">
            <Link href="/pricing" className="btn-primary text-sm px-6 py-2.5 inline-flex items-center gap-2">
              Explore Pro Plans <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}

      {/* Payment History */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold">Billing History & Receipts</h2>

        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-muted-foreground text-xs uppercase">
                <th className="py-3 px-4 font-semibold">Date</th>
                <th className="py-3 px-4 font-semibold">Description</th>
                <th className="py-3 px-4 font-semibold">Amount</th>
                <th className="py-3 px-4 font-semibold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {payments.length > 0 ? (
                payments.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 text-xs whitespace-nowrap">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-xs font-medium">
                      TheTathyaNews Pro Subscription
                    </td>
                    <td className="py-3 px-4 text-xs font-semibold whitespace-nowrap">
                      ${parseFloat(p.amount).toFixed(2)} {p.currency}
                    </td>
                    <td className="py-3 px-4 text-right text-xs whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 capitalize font-medium">
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-xs text-muted-foreground">
                    No transactions recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
