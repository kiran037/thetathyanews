///components/(auth)/reset-password-form.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Shield, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") || "";

  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: emailParam,
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
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
    setErrors({});

    if (formData.newPassword !== formData.confirmPassword) {
      setErrors({ confirmPassword: "Passwords do not match" });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          otp: formData.otp,
          newPassword: formData.newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Reset failed");
      }

      toast.success(data.message);
      router.push("/login");
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
      setErrors({ submit: error.message });
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
        body: JSON.stringify({ email: formData.email, purpose: "reset-password" }),
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="text-center text-sm text-muted-foreground mb-4">
        <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
          <Shield className="h-6 w-6 text-primary" />
        </div>
        Enter the code sent to <strong>{formData.email}</strong>
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
          className="text-center text-xl tracking-widest font-mono mt-1"
          value={formData.otp}
          onChange={(e) =>
            setFormData({ ...formData, otp: e.target.value.replace(/\D/g, "") })
          }
          required
          disabled={loading}
        />
      </div>

      <div>
        <Label htmlFor="newPassword" required>
          New Password
        </Label>
        <div className="relative mt-1">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="newPassword"
            type="password"
            placeholder="••••••••"
            className="pl-10"
            value={formData.newPassword}
            onChange={(e) =>
              setFormData({ ...formData, newPassword: e.target.value })
            }
            required
            disabled={loading}
          />
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          At least 8 characters with uppercase, lowercase, and number
        </p>
      </div>

      <div>
        <Label htmlFor="confirmPassword" required>
          Confirm New Password
        </Label>
        <div className="relative mt-1">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="confirmPassword"
            type="password"
            placeholder="••••••••"
            className="pl-10"
            value={formData.confirmPassword}
            onChange={(e) =>
              setFormData({ ...formData, confirmPassword: e.target.value })
            }
            error={errors.confirmPassword}
            required
            disabled={loading}
          />
        </div>
      </div>

      {errors.submit && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
          {errors.submit}
        </div>
      )}

      <Button type="submit" className="w-full" size="lg" loading={loading}>
        Reset Password
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