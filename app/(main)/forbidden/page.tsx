///app/(main)/forbidden/page.tsx
import Link from "next/link";
import { Shield, Home } from "lucide-react";
import { BackButton } from "@/components/ui/back-button";

export const metadata = {
  title: "403 Forbidden - TheTathyaNews",
  description: "Access denied",
};

export default function ForbiddenPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-destructive/10 mb-6">
            <Shield className="h-10 w-10 text-destructive" />
          </div>
          
          <h1 className="text-7xl font-bold text-destructive mb-4">403</h1>
          <h2 className="text-3xl font-bold mb-2">Access Forbidden</h2>
          <p className="text-muted-foreground">
            Sorry, you don't have permission to access this page. This content might be
            exclusive to subscribers or require special privileges.
          </p>
        </div>

        <div className="space-y-3">
          <Link
            href="/pricing"
            className="block rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            View Subscription Plans
          </Link>
          
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-md border border-border bg-background px-6 py-3 text-sm font-medium hover:bg-accent transition-colors"
          >
            <Home className="h-4 w-4" />
            Go Home
          </Link>
        </div>

        <BackButton />
      </div>
    </div>
  );
}