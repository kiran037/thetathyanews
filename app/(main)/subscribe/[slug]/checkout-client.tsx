// File: app/(main)/subscribe/[slug]/checkout-client.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CreditCard } from "lucide-react";
import { toast } from "sonner";

interface CheckoutButtonProps {
  planId: string;
  planSlug: string;
  planName: string;
}

export function CheckoutButton({ planId, planSlug, planName }: CheckoutButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleCheckout() {
    setLoading(true);

    try {
      const res = await fetch("/api/subscriptions/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId, planSlug }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to initialize checkout session");
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        router.push(`/subscribe/success?plan=${planSlug}`);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to proceed to checkout");
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCheckout}
      disabled={loading}
      className="btn-primary w-full py-3 text-sm font-semibold flex items-center justify-center gap-2 shadow-md"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <CreditCard className="h-4 w-4" />
      )}
      Confirm & Start Subscription
    </button>
  );
}
