///app/(main)/not-found.tsx
import Link from "next/link";
import { Home, Search } from "lucide-react";
import { BackButton } from "@/components/ui/back-button";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-9xl font-bold gradient-text mb-4">404</h1>
          <h2 className="text-3xl font-bold mb-2">Page Not Found</h2>
          <p className="text-muted-foreground">
            Oops! The page you're looking for seems to have vanished into the satirical void.
            Even our best investigative reporters couldn't find it.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Home className="h-4 w-4" />
            Go Home
          </Link>
          
          <Link
            href="/search"
            className="inline-flex items-center justify-center gap-2 rounded-md border border-border bg-background px-6 py-3 text-sm font-medium hover:bg-accent transition-colors"
          >
            <Search className="h-4 w-4" />
            Search Articles
          </Link>
        </div>

        <BackButton />
      </div>
    </div>
  );
}