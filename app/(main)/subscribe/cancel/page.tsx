// File: app/(main)/subscribe/cancel/page.tsx
import Link from "next/link";
import { XCircle, ArrowLeft, RefreshCw } from "lucide-react";

export const metadata = {
  title: "Checkout Cancelled - TheTathyaNews",
  description: "Your checkout was cancelled and no charges were made.",
};

export default function SubscribeCancelPage() {
  return (
    <div className="max-w-md mx-auto py-16 px-4 text-center space-y-6">
      <div className="w-16 h-16 rounded-full bg-muted text-muted-foreground mx-auto flex items-center justify-center">
        <XCircle className="h-8 w-8" />
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold">Checkout Cancelled</h1>
        <p className="text-muted-foreground text-sm">
          No charges were made to your account. You can continue reading free articles or revisit our subscription options anytime.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
        <Link href="/pricing" className="btn-primary px-6 py-2.5 text-sm inline-flex items-center justify-center gap-2">
          <RefreshCw className="h-4 w-4" />
          View Plans
        </Link>
        <Link href="/" className="btn-secondary px-6 py-2.5 text-sm inline-flex items-center justify-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>
      </div>
    </div>
  );
}
