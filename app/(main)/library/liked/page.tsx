// File: app/(main)/library/liked/page.tsx
// Liked articles page - shows articles user has reacted to

"use client";

import { useState, useEffect, Suspense } from "react";
import { Loader2, Heart, ThumbsUp, Laugh, Lightbulb, Brain, Angry, Trash2 } from "lucide-react";
import { LibraryArticleCard } from "@/components/main/library/library-article-card";
import { Pagination } from "@/components/ui/pagination";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";

const reactionIcons: Record<string, any> = {
  like: ThumbsUp,
  love: Heart,
  laugh: Laugh,
  insightful: Lightbulb,
  thinking: Brain,
  angry: Angry,
};

function LikedArticlesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = parseInt(searchParams.get("page") || "1");
  const reactionType = searchParams.get("type") || undefined;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchLiked();
  }, [page, reactionType]);

  const fetchLiked = async () => {
    try {
      setLoading(true);
      const url = new URL("/api/main/library/liked", window.location.origin);
      url.searchParams.set("page", page.toString());
      if (reactionType) url.searchParams.set("type", reactionType);

      const response = await fetch(url.toString());
      
      if (!response.ok) {
        if (response.status === 401) {
          router.push("/login?callbackUrl=/library/liked");
          return;
        }
        throw new Error("Failed to fetch liked articles");
      }

      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error("Error fetching liked articles:", error);
      toast.error("Failed to load liked articles");
    } finally {
      setLoading(false);
    }
  };

  const handleUnlike = async (articleId: string) => {
    try {
      setDeleting(articleId);
      const response = await fetch("/api/main/library/liked", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId }),
      });

      if (!response.ok) {
        throw new Error("Failed to remove reaction");
      }

      toast.success("Reaction removed");
      fetchLiked();
    } catch (error) {
      console.error("Error removing reaction:", error);
      toast.error("Failed to remove reaction");
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
      {/* Reaction Type Filters */}
      {data?.reactionCounts && Object.keys(data.reactionCounts).length > 0 && (
        <div className="flex flex-wrap gap-2 pb-4 border-b border-border">
          <Link
            href="/library/liked"
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              !reactionType
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            All Reactions ({data.total})
          </Link>
          {Object.entries(data.reactionCounts).map(([type, count]: [string, any]) => {
            const Icon = reactionIcons[type] || Heart;
            return (
              <Link
                key={type}
                href={`/library/liked?type=${type}`}
                className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1.5 transition-colors ${
                  reactionType === type
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="capitalize">{type}</span> ({count})
              </Link>
            );
          })}
        </div>
      )}

      {/* Articles Grid */}
      {!data?.articles || data.articles.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <Heart className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No liked articles yet</h3>
          <p className="text-muted-foreground mb-4">
            React to articles with likes, laughs, and insights to save them here
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
                  showReaction
                />
                <button
                  onClick={() => handleUnlike(item.article.id)}
                  disabled={deleting === item.article.id}
                  className="absolute top-2 right-2 p-1.5 bg-background/80 hover:bg-destructive hover:text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-all z-10"
                  title="Remove reaction"
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
                baseUrl="/library/liked"
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function LikedArticlesPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <Heart className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Liked Articles</h1>
        </div>
        <p className="text-muted-foreground">
          Articles you've reacted to across TheTathyaNews
        </p>
      </div>

      <Suspense
        fallback={
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        }
      >
        <LikedArticlesContent />
      </Suspense>
    </div>
  );
}