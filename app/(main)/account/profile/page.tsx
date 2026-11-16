
///app/(main)/account/profile/page.tsx - Profile
import { requireAuth } from "@/lib/auth-server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ProfileForm } from "@/components/main/account/profile-form";

export const metadata = {
  title: "Profile - Account Settings",
};

export default async function ProfilePage() {
  const user = await requireAuth();

  const [userDetails] = await db
    .select()
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Profile</h2>
        <p className="text-muted-foreground">
          Manage your personal information and preferences
        </p>
      </div>

      <div className="rounded-lg border border-border bg-card p-6">
        <ProfileForm user={userDetails} />
      </div>
    </div>
  );
}