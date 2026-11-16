// File: app/error.tsx
"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to server-side observability / console without exposing to UI
    console.error("Root error boundary caught error:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-16 px-4">
      <div className="max-w-md w-full text-center space-y-6 bg-card border border-border rounded-xl p-8 shadow-sm">
        <div className="w-16 h-16 rounded-full bg-destructive/10 text-destructive mx-auto flex items-center justify-center">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">
            Something Went Wrong
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            An unexpected editorial glitch occurred while rendering this page. Our newsroom engineers have been alerted.
          </p>
          {error.digest && (
            <p className="text-[11px] font-mono text-muted-foreground/70 pt-1">
              Incident ID: {error.digest}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <button
            onClick={() => reset()}
            className="btn-primary py-2.5 px-5 flex items-center justify-center gap-2 text-sm font-medium"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>

          <Link
            href="/"
            className="btn-outline py-2.5 px-5 flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <Home className="w-4 h-4" />
            Go to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
