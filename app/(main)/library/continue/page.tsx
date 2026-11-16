// File: app/(main)/library/continue/page.tsx
// Continue reading page - shows articles user started but hasn't finished

"use client";

import { useState, useEffect, Suspense } from "react";
import { Loader2, PlayCircle, BookOpen } from "lucide-react";
import { LibraryArticleCard } from "@/components/main/library/library-article-card";
import { Pagination } from "@/components/ui/pagination";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";

function ContinueReadingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = parseInt(searchParams.get("page") || "1");

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContinueReading();
  }, [page]);

  const fetchContinueReading = async () => {
    try {
      setLoading(true);
      const url = new URL("/api/main/library/continue", window.location.origin);
      url.searchParams.set("page", page.toString());

      const response = await fetch(url.toString());
      
      if (!response.ok) {
        if (response.status === 401) {
          router.push("/login?callbackUrl=/library/continue");
          return;
        }
        throw new Error("Failed to fetch articles");
      }

      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error("Error fetching continue reading:", error);
      toast.error("Failed to load articles");
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

  if (!data || data.articles.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
          <BookOpen className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No articles in progress</h3>
        <p className="text-muted-foreground mb-4">
          Articles you start reading will appear here so you can easily continue
        </p>
        <Link href="/" className="btn-primary inline-flex items-center gap-2">
          Discover Articles
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.articles.map((item: any) => (
          <LibraryArticleCard
            key={item.id}
            data={item}
            showProgress
            showTimeSpent
          />
        ))}
      </div>

      {data.pagination && data.pagination.totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <Pagination
            currentPage={data.pagination.page}
            totalPages={data.pagination.totalPages}
            baseUrl="/library/continue"
          />
        </div>
      )}
    </div>
  );
}

export default function ContinueReadingPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <PlayCircle className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Continue Reading</h1>
        </div>
        <p className="text-muted-foreground">
          Pick up where you left off
        </p>
      </div>

      <Suspense
        fallback={
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        }
      >
        <ContinueReadingContent />
      </Suspense>
    </div>
  );
}