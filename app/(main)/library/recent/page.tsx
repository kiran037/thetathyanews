// File: app/(main)/library/recent/page.tsx
// Recently viewed page - shows articles user viewed in the last 30 days

"use client";

import { useState, useEffect, Suspense } from "react";
import { Loader2, Clock, Calendar } from "lucide-react";
import { LibraryArticleCard } from "@/components/main/library/library-article-card";
import { Pagination } from "@/components/ui/pagination";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";

function RecentlyViewedContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = parseInt(searchParams.get("page") || "1");
  const days = parseInt(searchParams.get("days") || "30");

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecent();
  }, [page, days]);

  const fetchRecent = async () => {
    try {
      setLoading(true);
      const url = new URL("/api/main/library/recent", window.location.origin);
      url.searchParams.set("page", page.toString());
      url.searchParams.set("days", days.toString());

      const response = await fetch(url.toString());
      
      if (!response.ok) {
        if (response.status === 401) {
          router.push("/login?callbackUrl=/library/recent");
          return;
        }
        throw new Error("Failed to fetch recent articles");
      }

      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error("Error fetching recent articles:", error);
      toast.error("Failed to load recent articles");
    } finally {
      setLoading(false);
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
      {/* Time Range Filters */}
      <div className="flex gap-2 pb-4 border-b border-border">
        <Link
          href="/library/recent?days=7"
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            days === 7
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          Last 7 Days
        </Link>
        <Link
          href="/library/recent?days=30"
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            days === 30
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          Last 30 Days
        </Link>
        <Link
          href="/library/recent?days=90"
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            days === 90
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          Last 90 Days
        </Link>
      </div>

      {/* Articles Grid */}
      {!data?.articles || data.articles.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <Clock className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No recently viewed articles</h3>
          <p className="text-muted-foreground mb-4">
            Articles you open will appear here for quick access
          </p>
          <Link href="/" className="btn-primary inline-flex items-center gap-2">
            Discover Articles
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.articles.map((item: any) => (
              <LibraryArticleCard
                key={item.id}
                data={item}
                showProgress
              />
            ))}
          </div>

          {/* Pagination */}
          {data.pagination && data.pagination.totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <Pagination
                currentPage={data.pagination.page}
                totalPages={data.pagination.totalPages}
                baseUrl="/library/recent"
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function RecentlyViewedPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <Clock className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Recently Viewed</h1>
        </div>
        <p className="text-muted-foreground">
          Articles you've opened in the last {30} days
        </p>
      </div>

      <Suspense
        fallback={
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        }
      >
        <RecentlyViewedContent />
      </Suspense>
    </div>
  );
}