"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  // Use resolvedTheme to know if it's actually dark or light (even in system mode)
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button className="w-9 h-9 rounded-md border border-border bg-background flex items-center justify-center">
        <div className="h-4 w-4" /> {/* Placeholder to prevent layout shift */}
      </button>
    );
  }

  return (
    <button
      // Logic fix: toggle based on what is currently displayed (resolvedTheme)
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="w-9 h-9 rounded-md border border-border bg-background hover:bg-accent transition-colors flex items-center justify-center"
      aria-label="Toggle theme"
    >
      {resolvedTheme === "dark" ? (
        <Sun className="h-4 w-4 text-foreground" />
      ) : (
        <Moon className="h-4 w-4 text-foreground" />
      )}
    </button>
  );
}