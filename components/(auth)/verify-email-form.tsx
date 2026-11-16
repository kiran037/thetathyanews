///components/(auth)/verify-email-form.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") || "";

  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState(emailParam);
  const [canResend, setCanResend] = useState(false);
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Verification failed");
      }

      toast.success("Email verified successfully!");
      router.push("/");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Invalid verification code");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;

    setResendLoading(true);

    try {
      const response = await fetch("/api/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, purpose: "signup" }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to resend code");
      }

      toast.success(data.message);
      setCanResend(false);
      setCountdown(60);
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center">
        <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <Shield className="h-6 w-6 text-primary" />
        </div>
        <p className="text-sm text-muted-foreground">
          We've sent a 6-digit verification code to
        </p>
        <p className="font-semibold mt-1">{email}</p>
      </div>

      <div>
        <Label htmlFor="otp" required>
          Verification Code
        </Label>
        <Input
          id="otp"
          type="text"
          placeholder="000000"
          maxLength={6}
          className="text-center text-2xl tracking-widest font-mono mt-1"
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
          required
          disabled={loading}
          autoFocus
        />
        <p className="mt-1 text-xs text-muted-foreground text-center">
          Enter the 6-digit code from your email
        </p>
      </div>

      <Button type="submit" className="w-full" size="lg" loading={loading}>
        Verify Email
      </Button>

      <div className="text-center">
        <p className="text-sm text-muted-foreground mb-2">
          Didn't receive the code?
        </p>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleResend}
          disabled={!canResend || resendLoading}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${resendLoading ? "animate-spin" : ""}`} />
          {canResend ? "Resend Code" : `Resend in ${countdown}s`}
        </Button>
      </div>
    </form>
  );
}