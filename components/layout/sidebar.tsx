// File: components/layout/sidebar.tsx

"use client";

import Link from "next/link";
import { TrendingUp, Clock, Flame } from "lucide-react";
import { useState, useEffect } from "react";

interface SidebarData {
  trendingTopics: Array<{
    name: string;
    slug: string;
    count: number;
  }>;
  popularArticles: Array<any>;
}

export default function Sidebar() {
  const [data, setData] = useState<SidebarData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/main/sidebar")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setData(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden xl:block w-80 border-l border-border bg-card/50 overflow-y-auto sticky top-16 h-[calc(100vh-4rem)]">
        <div className="p-6 space-y-6">
          {/* Trending Topics */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h3 className="font-bold text-lg">Trending Topics</h3>
            </div>
            {loading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-14 bg-muted rounded-lg animate-pulse" />
                ))}
              </div>
            ) : data?.trendingTopics && data.trendingTopics.length > 0 ? (
              <div className="space-y-2">
                {data.trendingTopics.map((topic, index) => (
                  <Link
                    key={topic.slug}
                    href={`/tags/${topic.slug}`}
                    className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center">
                        {index + 1}
                      </span>
                      <span className="text-sm font-medium group-hover:text-primary transition-colors">
                        {topic.name}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">{topic.count}</span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No trending topics yet
              </p>
            )}
          </div>

          <div className="divider" />

          {/* Popular Articles */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Flame className="h-5 w-5 text-primary" />
              <h3 className="font-bold text-lg">Popular Now</h3>
            </div>
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-24 bg-muted rounded-lg animate-pulse" />
                ))}
              </div>
            ) : data?.popularArticles && data.popularArticles.length > 0 ? (
              <div className="space-y-4">
                {data.popularArticles.map((article, index) => (
                  <Link
                    key={article.id}
                    href={`/article/${article.slug}`}
                    className="block group"
                  >
                    <div className="flex gap-3">
                      <span className="flex-shrink-0 w-8 h-8 rounded bg-primary/10 text-primary font-bold text-sm flex items-center justify-center">
                        {index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        {article.category && (
                          <span className="inline-block px-2 py-0.5 text-xs font-semibold text-primary bg-primary/10 rounded mb-1">
                            {article.category.name}
                          </span>
                        )}
                        <h4 className="text-sm font-semibold line-clamp-2 group-hover:text-primary transition-colors mb-1">
                          {article.title}
                        </h4>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{article.viewCount} views</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No popular articles yet
              </p>
            )}
          </div>

          <div className="divider" />

          {/* Ad Space / CTA */}
          <div className="rounded-lg border border-border bg-gradient-to-br from-primary/5 to-primary/10 p-6 text-center">
            <h4 className="font-bold text-lg mb-2">Enjoying our satire?</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Support independent satirical journalism with a subscription.
            </p>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors w-full"
            >
              Subscribe Now
            </Link>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Toggle */}
      <div className="xl:hidden fixed bottom-4 right-4 z-40">
        <Link
          href="/article/trending"
          className="w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:bg-primary/90 transition-colors"
          aria-label="View trending"
        >
          <TrendingUp className="h-5 w-5" />
        </Link>
      </div>
    </>
  );
}