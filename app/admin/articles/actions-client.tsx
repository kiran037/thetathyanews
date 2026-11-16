// File: app/admin/articles/actions-client.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ExternalLink, Trash2, CheckCircle2, Clock, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface AdminArticleActionsProps {
  articleId: string;
  slug: string;
  currentStatus: string;
}

export function AdminArticleActions({
  articleId,
  slug,
  currentStatus,
}: AdminArticleActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleToggleStatus() {
    const nextStatus = currentStatus === "published" ? "draft" : "published";
    setLoading(true);

    try {
      const res = await fetch(`/api/admin/articles`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId, status: nextStatus }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to update article status");
      }

      toast.success(`Article set to ${nextStatus}`);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to archive this article?")) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/articles?id=${articleId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to delete article");
      }

      toast.success("Article archived successfully");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to archive article");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="inline-flex items-center gap-2">
      <Link
        href={`/article/${slug}`}
        target="_blank"
        className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
        title="View live article"
      >
        <ExternalLink className="h-4 w-4" />
      </Link>

      <button
        type="button"
        onClick={handleToggleStatus}
        disabled={loading}
        className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
          currentStatus === "published"
            ? "bg-amber-500/10 text-amber-600 hover:bg-amber-500/20"
            : "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20"
        }`}
        title={currentStatus === "published" ? "Unpublish to draft" : "Publish article"}
      >
        {loading ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : currentStatus === "published" ? (
          "Unpublish"
        ) : (
          "Publish"
        )}
      </button>

      <button
        type="button"
        onClick={handleDelete}
        disabled={loading}
        className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
        title="Archive article"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
