// File: app/admin/settings/page.tsx
import { Settings, ShieldAlert, Sparkles } from "lucide-react";
import { getAdminSettings } from "@/lib/data/admin";
import { AdminSettingsForm } from "./form-client";

export const metadata = {
  title: "Settings - TheTathyaNews Admin",
  description: "Configure publication parameters and operational settings",
};

export default async function AdminSettingsPage() {
  const settings = await getAdminSettings();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Publication Settings</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Manage live application parameters, moderation workflows, and publication metadata
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <AdminSettingsForm initialSettings={settings} />
      </div>
    </div>
  );
}
