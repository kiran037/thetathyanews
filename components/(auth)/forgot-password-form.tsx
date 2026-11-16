///components/(auth)/forgot-password-form.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export function ForgotPasswordForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Request failed");
      }

      toast.success(data.message);
      setSubmitted(true);
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="space-y-6 text-center">
        <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <Mail className="h-6 w-6 text-primary" />
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Check Your Email</h3>
          <p className="text-sm text-muted-foreground">
            If an account exists for <strong>{email}</strong>, you will receive
            a password reset code shortly.
          </p>
        </div>

        <Button
          className="w-full"
          size="lg"
          onClick={() =>
            router.push(`/reset-password?email=${encodeURIComponent(email)}`)
          }
        >
          Continue to Reset Password
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setSubmitted(false)}
          className="w-full"
        >
          Try a Different Email
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="text-center text-sm text-muted-foreground mb-4">
        Enter your email address and we'll send you a code to reset your password.
      </div>

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
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            autoFocus
          />
        </div>
      </div>

      <Button type="submit" className="w-full" size="lg" loading={loading}>
        Send Reset Code
      </Button>

      <Button
        type="button"
        variant="ghost"
        className="w-full gap-2"
        onClick={() => router.push("/login")}
        disabled={loading}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Sign In
      </Button>
    </form>
  );
}