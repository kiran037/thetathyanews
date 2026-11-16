// File: app/(main)/article/trending/page.tsx
// Trending articles page - shows most popular articles from last 7 days

import { Suspense } from "react";
import { Loader2, TrendingUp } from "lucide-react";
import { ArticleCard } from "@/components/main/article/article-card";

import { getTrendingArticles } from "@/lib/data/articles";

export const metadata = {
  title: "Trending Articles - TheTathyaNews",
  description: "Most popular satirical articles right now",
};

export default async function TrendingPage() {
  const articles = await getTrendingArticles({ limit: 20, days: 7 });
  const data = { articles };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <TrendingUp className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Trending Now</h1>
        </div>
        <p className="text-muted-foreground">
          Most popular satirical articles from the past week
        </p>
      </div>

      {/* Articles Grid */}
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        }
      >
        {data.articles.length === 0 ? (
          <div className="text-center py-12">
            <TrendingUp className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Trending Articles</h3>
            <p className="text-muted-foreground">
              Check back soon for trending content
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.articles.map((article: any, index: number) => (
              <div key={article.id} className="relative">
                {index < 3 && (
                  <div className="absolute -top-3 -left-3 z-10 w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center shadow-lg">
                    {index + 1}
                  </div>
                )}
                <ArticleCard article={article} />
              </div>
            ))}
          </div>
        )}
      </Suspense>
    </div>
  );
}