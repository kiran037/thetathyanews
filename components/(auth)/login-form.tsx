///components/(auth)/login-form.tsx
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock } from "lucide-react";
import { toast } from "sonner";

function getSafeRedirectUrl(url: string | null): string {
  if (!url) return "/";
  // Enforce internal relative paths only (prevent https://evil.com or //evil.com open redirects)
  if (url.startsWith("/") && !url.startsWith("//") && !url.includes("://") && !url.startsWith("/\\")) {
    return url;
  }
  return "/";
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawTarget = searchParams.get("callbackUrl") || searchParams.get("from");
  const callbackUrl = getSafeRedirectUrl(rawTarget);

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.requiresVerification) {
          toast.error(data.error);
          router.push(`/verify-email?email=${encodeURIComponent(formData.email)}`);
          return;
        }
        throw new Error(data.error || "Login failed");
      }

      toast.success("Welcome back!");
      router.push(callbackUrl);
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
      setErrors({ submit: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="email" required>
          Email Address
        </Label>
        <div className="relative mt-1">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            className="pl-10"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            required
            disabled={loading}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="password" required>
          Password
        </Label>
        <div className="relative mt-1">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            className="pl-10"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            required
            disabled={loading}
          />
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <Link href="/forgot-password" className="link">
          Forgot password?
        </Link>
      </div>

      {errors.submit && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
          {errors.submit}
        </div>
      )}

      <Button type="submit" className="w-full" size="lg" loading={loading}>
        Sign In
      </Button>

      <div className="divider">
        <span className="text-xs text-muted-foreground bg-background px-2">
          Don't have an account?
        </span>
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={() => router.push("/signup")}
        disabled={loading}
      >
        Create Account
      </Button>
    </form>
  );
}