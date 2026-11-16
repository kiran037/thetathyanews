
///app/(main)/account/preferences/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Settings, Moon, Sun, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "@/components/theme-provider";

export default function PreferencesPage() {
  const { theme, setTheme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [prefs, setPrefs] = useState({
    theme: "system",
    compactMode: false,
    autoplayVideos: true,
    showReadingTime: true,
  });

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const response = await fetch("/api/account/preferences");
      const data = await response.json();
      if (data.preferences) {
        setPrefs(data.preferences);
      }
    } catch (error) {
      toast.error("Failed to load preferences");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      const response = await fetch("/api/account/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prefs),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      // Apply theme immediately
      setTheme(prefs.theme as any);

      toast.success(data.message);
    } catch (error: any) {
      toast.error(error.message || "Failed to save preferences");
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
        <h2 className="text-2xl font-bold">Preferences</h2>
        <p className="text-muted-foreground">
          Customize your reading experience
        </p>
      </div>

      <div className="rounded-lg border border-border bg-card p-6 space-y-6">
        {/* Appearance */}
        <div>
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            Appearance
          </h3>

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium">Theme</label>
              <div className="grid grid-cols-3 gap-2">
                {["light", "dark", "system"].map((themeOption) => (
                  <button
                    key={themeOption}
                    onClick={() => setPrefs({ ...prefs, theme: themeOption })}
                    className={`p-3 rounded-lg border transition-colors ${
                      prefs.theme === themeOption
                        ? "border-primary bg-primary/10"
                        : "border-border hover:bg-accent"
                    }`}
                  >
                    {themeOption === "light" && <Sun className="h-4 w-4 mx-auto mb-1" />}
                    {themeOption === "dark" && <Moon className="h-4 w-4 mx-auto mb-1" />}
                    {themeOption === "system" && <Settings className="h-4 w-4 mx-auto mb-1" />}
                    <div className="text-xs capitalize">{themeOption}</div>
                  </button>
                ))}
              </div>
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={prefs.compactMode}
                onChange={(e) => setPrefs({ ...prefs, compactMode: e.target.checked })}
                className="mt-1"
              />
              <div>
                <div className="font-medium">Compact Mode</div>
                <div className="text-sm text-muted-foreground">
                  Show more content on screen
                </div>
              </div>
            </label>
          </div>
        </div>

        <div className="divider" />

        {/* Reading Experience */}
        <div>
          <h3 className="font-semibold mb-4">Reading Experience</h3>

          <div className="space-y-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={prefs.autoplayVideos}
                onChange={(e) => setPrefs({ ...prefs, autoplayVideos: e.target.checked })}
                className="mt-1"
              />
              <div>
                <div className="font-medium">Autoplay Videos</div>
                <div className="text-sm text-muted-foreground">
                  Automatically play videos when scrolling
                </div>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={prefs.showReadingTime}
                onChange={(e) => setPrefs({ ...prefs, showReadingTime: e.target.checked })}
                className="mt-1"
              />
              <div>
                <div className="font-medium">Show Reading Time</div>
                <div className="text-sm text-muted-foreground">
                  Display estimated reading time on articles
                </div>
              </div>
            </label>
          </div>
        </div>

        <Button onClick={handleSave} loading={saving}>
          Save Preferences
        </Button>
      </div>
    </div>
  );
}

