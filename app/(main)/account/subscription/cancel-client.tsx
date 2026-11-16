// File: app/(main)/account/subscription/cancel-client.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export function CancelSubscriptionButton({ subscriptionId }: { subscriptionId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleCancel() {
    if (!confirm("Are you sure you want to cancel your subscription renewal? Your benefits will remain active until the end of your prepaid period.")) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/account/subscription/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscriptionId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to cancel subscription");
      }

      toast.success("Subscription will end at the close of your current billing cycle.");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to cancel subscription");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCancel}
      disabled={loading}
      className="btn-ghost text-xs text-destructive hover:bg-destructive/10 px-3 py-1.5"
    >
      {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : "Cancel Renewal"}
    </button>
  );
}
