// File: app/(main)/library/page.tsx
// Main library page - overview with quick access to all library sections

"use client";

import { useState, useEffect } from "react";
import { Loader2, Library, History, PlayCircle, Heart, Clock, ArrowRight } from "lucide-react";
import { LibraryArticleCard } from "@/components/main/library/library-article-card";
import { LibraryStats } from "@/components/main/library/library-stats";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LibraryPage() {
  const router = useRouter();
  const [historyData, setHistoryData] = useState<any>(null);
  const [continueData, setContinueData] = useState<any>(null);
  const [likedData, setLikedData] = useState<any>(null);
  const [recentData, setRecentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOverview();
  }, []);

  const fetchOverview = async () => {
    try {
      setLoading(true);

      // Fetch all library sections (limited to 3 items each)
      const [history, continueReading, liked, recent] = await Promise.all([
        fetch("/api/main/library/history?limit=3").then((r) => (r.ok ? r.json() : null)),
        fetch("/api/main/library/continue?limit=3").then((r) => (r.ok ? r.json() : null)),
        fetch("/api/main/library/liked?limit=3").then((r) => (r.ok ? r.json() : null)),
        fetch("/api/main/library/recent?limit=3").then((r) => (r.ok ? r.json() : null)),
      ]);

      setHistoryData(history);
      setContinueData(continueReading);
      setLikedData(liked);
      setRecentData(recent);
    } catch (error) {
      console.error("Error fetching library overview:", error);
      // Check if user is not authenticated
      if (error instanceof Response && error.status === 401) {
        router.push("/login?callbackUrl=/library");
      }
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
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-3 mb-3">
          <Library className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold">My Library</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Your personal collection of articles and reading progress
        </p>
      </div>

      {/* Stats */}
      {historyData?.stats && <LibraryStats stats={historyData.stats} />}

      {/* Quick Access Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          href="/library/history"
          className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-all group"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <History className="h-5 w-5 text-blue-500" />
            </div>
            <h3 className="font-bold">Reading History</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            All articles you&apos;ve read
          </p>
          <div className="flex items-center gap-2 text-sm text-primary font-medium">
            View all
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link
          href="/library/continue"
          className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-all group"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <PlayCircle className="h-5 w-5 text-green-500" />
            </div>
            <h3 className="font-bold">Continue Reading</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            Pick up where you left off
          </p>
          <div className="flex items-center gap-2 text-sm text-primary font-medium">
            Continue
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link
          href="/library/liked"
          className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-all group"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
              <Heart className="h-5 w-5 text-red-500" />
            </div>
            <h3 className="font-bold">Liked Articles</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            Articles you reacted to
          </p>
          <div className="flex items-center gap-2 text-sm text-primary font-medium">
            View all
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link
          href="/library/recent"
          className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-all group"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <Clock className="h-5 w-5 text-purple-500" />
            </div>
            <h3 className="font-bold">Recently Viewed</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            Your recent activity
          </p>
          <div className="flex items-center gap-2 text-sm text-primary font-medium">
            View all
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>

      {/* Continue Reading Section */}
      {continueData?.articles && continueData.articles.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <PlayCircle className="h-6 w-6 text-primary" />
              Continue Reading
            </h2>
            <Link href="/library/continue" className="text-sm text-primary hover:underline">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {continueData.articles.slice(0, 3).map((item: any) => (
              <LibraryArticleCard
                key={item.id}
                data={item}
                showProgress={true}
              />
            ))}
          </div>
        </div>
      )}

      {/* Recently Viewed Section */}
      {recentData?.articles && recentData.articles.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Clock className="h-6 w-6 text-primary" />
              Recently Viewed
            </h2>
            <Link href="/library/recent" className="text-sm text-primary hover:underline">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recentData.articles.slice(0, 3).map((item: any) => (
              <LibraryArticleCard
                key={item.id}
                data={item}
                showProgress={false}
              />
            ))}
          </div>
        </div>
      )}

      {/* Liked Articles Section */}
      {likedData?.articles && likedData.articles.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Heart className="h-6 w-6 text-primary" />
              Liked Articles
            </h2>
            <Link href="/library/liked" className="text-sm text-primary hover:underline">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {likedData.articles.slice(0, 3).map((item: any) => (
              <LibraryArticleCard
                key={item.id}
                data={item}
                showReaction={true}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!continueData?.articles?.length &&
        !recentData?.articles?.length &&
        !likedData?.articles?.length && (
          <div className="text-center py-12 bg-card border border-border rounded-lg">
            <Library className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Your Library is Empty</h3>
            <p className="text-muted-foreground mb-6">
              Start reading articles to build your personal library
            </p>
            <Link href="/article" className="btn-primary">
              Browse Articles
            </Link>
          </div>
        )}
    </div>
  );
}