"use client";

import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
  label?: string;
  className?: string;
}

export function BackButton({
  label = "Go back to previous page",
  className = "inline-flex items-center gap-2 mt-6 text-sm text-muted-foreground hover:text-foreground transition-colors",
}: BackButtonProps) {
  return (
    <button
      type="button"
      onClick={() => window.history.back()}
      className={className}
    >
      <ArrowLeft className="h-4 w-4" />
      {label}
    </button>
  );
}
