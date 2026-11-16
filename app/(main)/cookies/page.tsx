// File: app/(main)/cookies/page.tsx
import Link from "next/link";
import { Cookie, Settings, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Cookie Policy - TheTathyaNews",
  description: "Information about how TheTathyaNews uses cookies and browser storage technologies.",
};

export default function CookiesPage() {
  const cookieTypes = [
    {
      name: "Essential Authentication Cookies",
      key: "session_token",
      purpose: "Maintains your secure logged-in state across reader pages. HTTP-only and protected against cross-site scripting.",
      type: "Strictly Necessary",
    },
    {
      name: "Theme & UI Preferences",
      key: "theme",
      purpose: "Preserves your chosen color theme (dark mode, light mode, or system default) between browsing visits.",
      type: "Functional",
    },
    {
      name: "Guest Reading Progress",
      key: "thetathya_reading_progress",
      purpose: "Locally records your article reading position in browser localStorage so you can resume where you left off without requiring an account.",
      type: "Functional (Local Storage)",
    },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-4">
      <div>
        <div className="flex items-center gap-2 text-primary text-xs font-semibold uppercase tracking-wider mb-2">
          <Cookie className="h-4 w-4" />
          Browser Technologies
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Cookie Policy</h1>
        <p className="text-xs text-muted-foreground mt-2">Effective Date: January 1, 2026 · Last Updated: September 2026</p>
      </div>

      <div className="prose prose-sm dark:prose-invert max-w-none space-y-6 text-muted-foreground leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-foreground">1. What Are Cookies?</h2>
          <p>
            Cookies are small text files placed on your device by websites you visit. They are widely used to make websites work efficiently, enable user authentication, and remember your interface preferences.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-bold text-foreground">2. Cookies We Use</h2>
          <div className="space-y-3">
            {cookieTypes.map((c) => (
              <div key={c.name} className="rounded-lg border border-border bg-card p-4 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-semibold text-foreground text-sm">{c.name}</h3>
                  <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground font-medium">
                    {c.type}
                  </span>
                </div>
                <p className="text-xs font-mono text-primary">Identifier: {c.key}</p>
                <p className="text-xs text-muted-foreground">{c.purpose}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-foreground">3. How to Manage Cookies</h2>
          <p>
            Most web browsers allow you to control cookies through browser settings. You can configure your browser to reject all cookies or to alert you when a cookie is placed. However, disabling the `session_token` cookie will prevent you from logging into your account and accessing subscriber features.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-foreground">4. Updates to This Policy</h2>
          <p>
            We may periodically update this Cookie Policy to reflect changes in our operational technologies or applicable legal requirements. The updated date at the top of this page indicates the most recent revision.
          </p>
        </section>
      </div>
    </div>
  );
}
