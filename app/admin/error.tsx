// File: app/admin/error.tsx
"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw, LayoutDashboard } from "lucide-react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin dashboard runtime error:", error);
  }, [error]);

  return (
    <div className="p-8 flex items-center justify-center min-h-[60vh]">
      <div className="max-w-md w-full text-center space-y-6 bg-card border border-border rounded-xl p-8 shadow-sm">
        <div className="w-14 h-14 rounded-full bg-destructive/10 text-destructive mx-auto flex items-center justify-center">
          <AlertCircle className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold text-foreground">
            Admin Workspace Error
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Failed to load admin workspace data. Your changes may not have been saved.
          </p>
          {error.digest && (
            <p className="text-xs font-mono text-muted-foreground/60">
              Digest: {error.digest}
            </p>
          )}
        </div>

        <div className="flex gap-3 justify-center pt-2">
          <button
            onClick={() => reset()}
            className="btn-primary py-2 px-4 flex items-center gap-2 text-sm font-medium"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
          <Link
            href="/admin"
            className="btn-outline py-2 px-4 flex items-center gap-2 text-sm font-medium"
          >
            <LayoutDashboard className="w-4 h-4" />
            Admin Overview
          </Link>
        </div>
      </div>
    </div>
  );
}
