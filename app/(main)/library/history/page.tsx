// File: app/(main)/library/history/page.tsx
// Reading history page - shows all articles user has read

"use client";

import { useState, useEffect, Suspense } from "react";
import { Loader2, History, Filter, Trash2 } from "lucide-react";
import { LibraryArticleCard } from "@/components/main/library/library-article-card";
import { LibraryStats } from "@/components/main/library/library-stats";
import { Pagination } from "@/components/ui/pagination";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";

function ReadingHistoryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = parseInt(searchParams.get("page") || "1");
  const filter = searchParams.get("filter") || undefined;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchHistory();
  }, [page, filter]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const url = new URL("/api/main/library/history", window.location.origin);
      url.searchParams.set("page", page.toString());
      if (filter) url.searchParams.set("filter", filter);

      const response = await fetch(url.toString());
      
      if (!response.ok) {
        if (response.status === 401) {
          router.push("/login?callbackUrl=/library/history");
          return;
        }
        throw new Error("Failed to fetch history");
      }

      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error("Error fetching history:", error);
      toast.error("Failed to load reading history");
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (!confirm("Are you sure you want to clear your reading history? This cannot be undone.")) {
      return;
    }

    try {
      const response = await fetch("/api/main/library/history?clearAll=true", {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to clear history");
      }

      toast.success("Reading history cleared");
      fetchHistory();
    } catch (error) {
      console.error("Error clearing history:", error);
      toast.error("Failed to clear history");
    }
  };

  const handleDeleteItem = async (historyId: string) => {
    try {
      setDeleting(historyId);
      const response = await fetch(`/api/main/library/history?id=${historyId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to remove item");
      }

      toast.success("Removed from history");
      fetchHistory();
    } catch (error) {
      console.error("Error removing item:", error);
      toast.error("Failed to remove item");
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Summary */}
      {data?.stats && <LibraryStats stats={data.stats} />}

      {/* Filter Tabs & Clear Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="flex gap-2">
          <Link
            href="/library/history"
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              !filter ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            All
          </Link>
          <Link
            href="/library/history?filter=completed"
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              filter === "completed" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            Completed
          </Link>
          <Link
            href="/library/history?filter=in_progress"
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              filter === "in_progress" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            In Progress
          </Link>
        </div>

        {data?.articles && data.articles.length > 0 && (
          <button
            onClick={handleClearHistory}
            className="btn-destructive px-3 py-1.5 text-xs flex items-center gap-1.5"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Clear All History
          </button>
        )}
      </div>

      {/* Articles Grid */}
      {!data?.articles || data.articles.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <History className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No reading history yet</h3>
          <p className="text-muted-foreground mb-4">
            Articles you read will be tracked here
          </p>
          <Link href="/" className="btn-primary inline-flex items-center gap-2">
            Discover Articles
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.articles.map((item: any) => (
              <div key={item.id} className="relative group">
                <LibraryArticleCard
                  data={item}
                  showProgress
                  showTimeSpent
                />
                <button
                  onClick={() => handleDeleteItem(item.id)}
                  disabled={deleting === item.id}
                  className="absolute top-2 right-2 p-1.5 bg-background/80 hover:bg-destructive hover:text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-all z-10"
                  title="Remove from history"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {data.pagination && data.pagination.totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <Pagination
                currentPage={data.pagination.page}
                totalPages={data.pagination.totalPages}
                baseUrl="/library/history"
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function ReadingHistoryPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <History className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Reading History</h1>
        </div>
        <p className="text-muted-foreground">
          Articles you've read on TheTathyaNews
        </p>
      </div>

      <Suspense
        fallback={
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        }
      >
        <ReadingHistoryContent />
      </Suspense>
    </div>
  );
}