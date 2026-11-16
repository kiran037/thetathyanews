// File: app/(main)/account-suspended/page.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldAlert, Mail, ArrowLeft, LogOut } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

export default function AccountSuspendedPage() {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await fetch("/api/logout", { method: "POST" });
      toast.success("Logged out successfully");
      router.push("/");
      router.refresh();
    } catch {
      router.push("/");
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full text-center space-y-6 bg-card border border-border rounded-xl p-8 shadow-sm">
        {/* Warning Icon */}
        <div className="w-16 h-16 rounded-full bg-destructive/10 text-destructive mx-auto flex items-center justify-center">
          <ShieldAlert className="w-8 h-8" />
        </div>

        {/* Headline */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">
            Account Suspended
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Your TheTathyaNews account has been temporarily suspended due to a potential violation of our Terms of Service or Community Guidelines.
          </p>
        </div>

        {/* Guidance Box */}
        <div className="bg-muted/50 border border-border/60 rounded-lg p-4 text-xs text-muted-foreground text-left space-y-2">
          <p className="font-medium text-foreground">What does this mean?</p>
          <ul className="list-disc pl-4 space-y-1">
            <li>You cannot publish, comment, or modify account data.</li>
            <li>Public satire articles remain freely accessible to read.</li>
            <li>If you believe this suspension is in error, our editorial support desk can review your case.</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 pt-2">
          <Link
            href="/contact?category=Support"
            className="btn-primary w-full py-2.5 flex items-center justify-center gap-2 text-sm font-medium"
          >
            <Mail className="w-4 h-4" />
            Contact Editorial Support
          </Link>

          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="btn-outline w-full py-2 flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <LogOut className="w-4 h-4" />
            {loggingOut ? "Logging out..." : "Sign Out"}
          </button>

          <Link
            href="/"
            className="inline-flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors pt-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
