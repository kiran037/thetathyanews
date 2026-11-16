// File: app/admin/settings/form-client.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, Check } from "lucide-react";
import { toast } from "sonner";

interface AdminSettingsFormProps {
  initialSettings: Record<string, any>;
}

export function AdminSettingsForm({ initialSettings }: AdminSettingsFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState(initialSettings);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update settings");
      }

      toast.success("Publication settings saved successfully!");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to save settings");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* 1. General Publication Details */}
      <div className="space-y-4">
        <h3 className="text-base font-semibold border-b border-border pb-2">
          General Publication Identity
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Publication Name</label>
            <input
              type="text"
              required
              value={settings.site_name || ""}
              onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
              className="w-full px-3.5 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Editorial Contact Email</label>
            <input
              type="email"
              required
              value={settings.contact_email || ""}
              onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
              className="w-full px-3.5 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="md:col-span-2 space-y-1.5">
            <label className="text-sm font-medium">Tagline / Motto</label>
            <input
              type="text"
              value={settings.site_tagline || ""}
              onChange={(e) => setSettings({ ...settings, site_tagline: e.target.value })}
              className="w-full px-3.5 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      {/* 2. Editorial & Moderation */}
      <div className="space-y-4">
        <h3 className="text-base font-semibold border-b border-border pb-2">
          Editorial & Community Moderation
        </h3>
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={!!settings.allow_comments}
              onChange={(e) => setSettings({ ...settings, allow_comments: e.target.checked })}
              className="rounded border-border text-primary focus:ring-primary h-4 w-4"
            />
            <div>
              <p className="text-sm font-medium">Allow Reader Comments</p>
              <p className="text-xs text-muted-foreground">Enable comment forms beneath published articles</p>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={!!settings.require_comment_approval}
              onChange={(e) => setSettings({ ...settings, require_comment_approval: e.target.checked })}
              className="rounded border-border text-primary focus:ring-primary h-4 w-4"
            />
            <div>
              <p className="text-sm font-medium">Require Pre-moderation Approval</p>
              <p className="text-xs text-muted-foreground">Comments must be manually approved by editors before public display</p>
            </div>
          </label>
        </div>
      </div>

      {/* 3. Subscription & Paywall */}
      <div className="space-y-4">
        <h3 className="text-base font-semibold border-b border-border pb-2">
          Subscription & Metered Access
        </h3>
        <div className="space-y-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={!!settings.enable_paywall}
              onChange={(e) => setSettings({ ...settings, enable_paywall: e.target.checked })}
              className="rounded border-border text-primary focus:ring-primary h-4 w-4"
            />
            <div>
              <p className="text-sm font-medium">Enable Metered Paywall</p>
              <p className="text-xs text-muted-foreground">Prompt casual readers to subscribe after free article quota is reached</p>
            </div>
          </label>

          <div className="max-w-xs space-y-1.5">
            <label className="text-sm font-medium">Free Articles per Month (Guests/Free)</label>
            <input
              type="number"
              min="1"
              max="50"
              value={settings.free_articles_limit || 5}
              onChange={(e) => setSettings({ ...settings, free_articles_limit: parseInt(e.target.value) || 5 })}
              className="w-full px-3.5 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end pt-4 border-t border-border">
        <button
          type="submit"
          disabled={loading}
          className="btn-primary inline-flex items-center gap-2 px-6 py-2.5 text-sm"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Save Settings
        </button>
      </div>
    </form>
  );
}
