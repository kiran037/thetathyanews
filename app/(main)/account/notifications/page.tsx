///app/(main)/account/notifications/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Bell, Mail, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function NotificationsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    emailNewsletter: true,
    emailArticles: true,
    emailComments: false,
    emailMarketing: false,
    pushEnabled: false,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/account/notifications");
      const data = await response.json();
      if (data.notifications) {
        setSettings(data.notifications);
      }
    } catch (error) {
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      const response = await fetch("/api/account/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      toast.success(data.message);
    } catch (error: any) {
      toast.error(error.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Notifications</h2>
        <p className="text-muted-foreground">
          Manage how you receive notifications
        </p>
      </div>

      <div className="rounded-lg border border-border bg-card p-6 space-y-6">
        {/* Email Notifications */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <Mail className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Email Notifications</h3>
          </div>

          <div className="space-y-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.emailNewsletter}
                onChange={(e) => setSettings({ ...settings, emailNewsletter: e.target.checked })}
                className="mt-1"
              />
              <div>
                <div className="font-medium">Newsletter</div>
                <div className="text-sm text-muted-foreground">
                  Weekly digest of top satirical stories
                </div>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.emailArticles}
                onChange={(e) => setSettings({ ...settings, emailArticles: e.target.checked })}
                className="mt-1"
              />
              <div>
                <div className="font-medium">New Articles</div>
                <div className="text-sm text-muted-foreground">
                  Get notified when new articles are published
                </div>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.emailComments}
                onChange={(e) => setSettings({ ...settings, emailComments: e.target.checked })}
                className="mt-1"
              />
              <div>
                <div className="font-medium">Comment Replies</div>
                <div className="text-sm text-muted-foreground">
                  When someone replies to your comments
                </div>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.emailMarketing}
                onChange={(e) => setSettings({ ...settings, emailMarketing: e.target.checked })}
                className="mt-1"
              />
              <div>
                <div className="font-medium">Promotional Emails</div>
                <div className="text-sm text-muted-foreground">
                  Special offers and updates
                </div>
              </div>
            </label>
          </div>
        </div>

        <div className="divider" />

        {/* Push Notifications */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <Bell className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Push Notifications</h3>
          </div>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.pushEnabled}
              onChange={(e) => setSettings({ ...settings, pushEnabled: e.target.checked })}
              className="mt-1"
            />
            <div>
              <div className="font-medium">Enable Push Notifications</div>
              <div className="text-sm text-muted-foreground">
                Receive real-time updates in your browser
              </div>
            </div>
          </label>
        </div>

        <Button onClick={handleSave} loading={saving}>
          Save Preferences
        </Button>
      </div>
    </div>
  );
}

