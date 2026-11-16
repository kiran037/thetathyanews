// File: app/admin/users/actions-client.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Shield, UserX, UserCheck } from "lucide-react";
import { toast } from "sonner";

interface AdminUserActionsProps {
  userId: string;
  currentStatus: string;
  currentRole: string;
}

export function AdminUserActions({
  userId,
  currentStatus,
  currentRole,
}: AdminUserActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleStatusToggle() {
    const nextStatus = currentStatus === "active" ? "suspended" : "active";
    if (nextStatus === "suspended" && !confirm("Suspend this user account?")) return;

    setLoading(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, status: nextStatus }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update user");
      }

      toast.success(`User marked as ${nextStatus}`);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to update user status");
    } finally {
      setLoading(false);
    }
  }

  async function handleRoleChange(newRole: string) {
    if (newRole === currentRole) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, roleSlug: newRole }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update role");
      }

      toast.success(`Role updated to ${newRole}`);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to update role");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="inline-flex items-center gap-2">
      <select
        value={currentRole}
        disabled={loading}
        onChange={(e) => handleRoleChange(e.target.value)}
        className="px-2 py-1 rounded text-xs border border-border bg-background focus:ring-1 focus:ring-primary focus:outline-none"
      >
        <option value="reader">Reader</option>
        <option value="writer">Writer</option>
        <option value="editor">Editor</option>
        <option value="admin">Admin</option>
      </select>

      <button
        type="button"
        onClick={handleStatusToggle}
        disabled={loading}
        className={`p-1.5 rounded transition-colors ${
          currentStatus === "active"
            ? "hover:bg-red-500/10 text-muted-foreground hover:text-red-500"
            : "hover:bg-emerald-500/10 text-muted-foreground hover:text-emerald-500"
        }`}
        title={currentStatus === "active" ? "Suspend user" : "Activate user"}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : currentStatus === "active" ? (
          <UserX className="h-4 w-4" />
        ) : (
          <UserCheck className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}
