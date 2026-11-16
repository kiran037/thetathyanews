///app/(main)/account/layout.tsx
import { requireAuth } from "@/lib/auth-server";
import { AccountNav } from "@/components/main/account/account-nav";

export const metadata = {
  title: "Account Settings - TheTathyaNews",
  description: "Manage your account settings and preferences",
};

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Account Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Navigation */}
        <aside className="lg:col-span-1">
          <div className="sticky top-20">
            <AccountNav />
          </div>
        </aside>

        {/* Main Content */}
        <main className="lg:col-span-3">{children}</main>
      </div>
    </div>
  );
}