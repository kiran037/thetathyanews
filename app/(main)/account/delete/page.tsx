
///app/(main)/account/delete/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export default function DeleteAccountPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();

    if (confirmation !== "DELETE") {
      toast.error('Please type "DELETE" to confirm');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/account/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, confirmation }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      toast.success(data.message);
      router.push("/");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-destructive">Delete Account</h2>
        <p className="text-muted-foreground">
          Permanently delete your account and all associated data
        </p>
      </div>

      <div className="rounded-lg border-2 border-destructive bg-destructive/5 p-6">
        <div className="flex gap-3 mb-4">
          <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-destructive mb-2">Warning: This action cannot be undone</h3>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Your account will be permanently deleted</li>
              <li>• All your comments and activity will be removed</li>
              <li>• Active subscriptions will be canceled</li>
              <li>• You will lose access to premium content</li>
            </ul>
          </div>
        </div>

        <form onSubmit={handleDelete} className="space-y-4 mt-6">
          <div>
            <Label htmlFor="password" required>Confirm Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              placeholder="Enter your password"
            />
          </div>

          <div>
            <Label htmlFor="confirmation" required>Type "DELETE" to confirm</Label>
            <Input
              id="confirmation"
              type="text"
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              required
              disabled={loading}
              placeholder="DELETE"
            />
          </div>

          <div className="flex gap-3">
            <Button
              type="submit"
              variant="destructive"
              loading={loading}
              disabled={confirmation !== "DELETE"}
            >
              Delete My Account
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/account")}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}