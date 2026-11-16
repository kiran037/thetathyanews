// File: app/not-found.tsx
import Link from "next/link";
import { Home, Search } from "lucide-react";

export default function RootNotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center py-16 px-4">
      <div className="text-center max-w-md mx-auto">
        <div className="mb-8">
          <h1 className="text-8xl font-black text-primary mb-3">404</h1>
          <h2 className="text-2xl font-bold mb-2 text-foreground">Page Not Found</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            The satirical dispatch or route you are looking for has ceased to exist, was archived, or was redacted by reality.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
          >
            <Home className="h-4 w-4" />
            Return Home
          </Link>

          <Link
            href="/search"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground hover:bg-accent transition-colors"
          >
            <Search className="h-4 w-4" />
            Search Archive
          </Link>
        </div>
      </div>
    </div>
  );
}
