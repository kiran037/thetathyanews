
///app/(main)/account/privacy/page.tsx
"use client";

import { Lock } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Privacy</h2>
        <p className="text-muted-foreground">
          Control your privacy and data settings
        </p>
      </div>

      <div className="rounded-lg border border-border bg-card p-6 space-y-6">
        <div className="flex items-center gap-3">
          <Lock className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Data & Privacy</h3>
        </div>

        <div className="space-y-4 text-sm">
          <div>
            <h4 className="font-medium mb-2">Your Data</h4>
            <p className="text-muted-foreground">
              We collect minimal data necessary to provide our services. You can request a copy of your data or delete your account at any time.
            </p>
          </div>

          <div>
            <h4 className="font-medium mb-2">Cookies</h4>
            <p className="text-muted-foreground">
              We use essential cookies for authentication. You can manage cookie preferences in your browser settings.
            </p>
          </div>

          <div>
            <h4 className="font-medium mb-2">Third-Party Services</h4>
            <p className="text-muted-foreground">
              We don't share your personal information with third parties except as required by law.
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-border">
          <a href="/privacy" className="link text-sm">
            Read our full Privacy Policy →
          </a>
        </div>
      </div>
    </div>
  );
}
