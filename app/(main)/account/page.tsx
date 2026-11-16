///app/(main)/account/page.tsx - Dashboard
import { requireAuth } from "@/lib/auth-server";
import { db } from "@/db";
import { users, subscriptions, subscriptionPlans } from "@/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { User, Shield, Calendar, Crown } from "lucide-react";
import { getAvatarUrl } from "@/lib/asset-url";

export default async function AccountPage() {
  const user = await requireAuth();

  const [userDetails] = await db
    .select()
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1);

  const activeSubs = await db
    .select({
      plan: subscriptionPlans.name,
      status: subscriptions.status,
      endDate: subscriptions.currentPeriodEnd,
    })
    .from(subscriptions)
    .innerJoin(subscriptionPlans, eq(subscriptions.planId, subscriptionPlans.id))
    .where(eq(subscriptions.userId, user.id))
    .limit(1);

  return (
    <div className="space-y-6">
      {/* Profile Card */}
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="flex items-center gap-4">
          <img
            src={getAvatarUrl(userDetails.avatarUrl)}
            alt={userDetails.displayName || "User"}
            className="w-20 h-20 rounded-full border-2 border-primary"
          />
          <div className="flex-1">
            <h2 className="text-2xl font-bold">
              {userDetails.displayName || `${userDetails.firstName} ${userDetails.lastName}` || "User"}
            </h2>
            <p className="text-muted-foreground">{userDetails.email}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Member since {new Date(userDetails.createdAt).toLocaleDateString()}
            </p>
          </div>
          <Link
            href="/account/profile"
            className="btn-primary px-4 py-2"
          >
            Edit Profile
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Account Status</p>
              <p className="font-semibold capitalize">{userDetails.status}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email Verified</p>
              <p className="font-semibold">{userDetails.emailVerified ? "Yes" : "No"}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Crown className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Subscription</p>
              <p className="font-semibold">{activeSubs[0]?.plan || "Free"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Link href="/account/profile" className="p-4 rounded-lg border border-border hover:bg-accent transition-colors">
            <User className="h-5 w-5 mb-2 text-primary" />
            <h4 className="font-medium mb-1">Update Profile</h4>
            <p className="text-xs text-muted-foreground">Change your personal information</p>
          </Link>
          
          <Link href="/account/security" className="p-4 rounded-lg border border-border hover:bg-accent transition-colors">
            <Shield className="h-5 w-5 mb-2 text-primary" />
            <h4 className="font-medium mb-1">Security Settings</h4>
            <p className="text-xs text-muted-foreground">Update password and 2FA</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
