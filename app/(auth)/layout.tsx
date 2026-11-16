import type { Metadata } from "next";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

export const metadata: Metadata = {
  title: {
    default: "Authentication",
    template: "%s | TheTathyaNews",
  },
  description: "Secure authentication for TheTathyaNews portal.",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen w-full bg-background text-foreground antialiased">
      <Suspense fallback={<AuthLoading />}>
        {children}
      </Suspense>
    </main>
  );
}

function AuthLoading() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground animate-pulse">
          Securely loading...
        </p>
      </div>
    </div>
  );
}