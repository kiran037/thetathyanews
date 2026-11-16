// File: app/(main)/article/recommended/page.tsx
// Recommended articles page - personalized recommendations (requires authentication)

import { Suspense } from "react";
import { redirect } from "next/navigation";
import Link from "next/link"; // <--- Imported Link
import { Loader2, Sparkles } from "lucide-react";
import { getCurrentUser } from "@/lib/auth"; // <--- Swapped getSession for getCurrentUser
import { ArticleCard } from "@/components/main/article/article-card";

import { getRecommendedArticles } from "@/lib/data/articles";

export const metadata = {
  title: "Recommended For You - TheTathyaNews",
  description: "Personalized article recommendations",
};

export default async function RecommendedPage() {
  // Refactored auth logic using existing lib/auth.ts
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?callbackUrl=/article/recommended");
  }

  const articles = await getRecommendedArticles(user.id, 15);
  const data = { articles };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Recommended For You</h1>
        </div>
        <p className="text-muted-foreground">
          Personalized satirical articles based on your interests
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
            <Sparkles className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Recommendations Yet</h3>
            <p className="text-muted-foreground mb-4">
              Start reading articles to get personalized recommendations
            </p>
            {/* Fixed: Replaced <a> with <Link> */}
            <Link href="/article" className="btn-primary">
              Browse All Articles
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.articles.map((article: any) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </Suspense>
    </div>
  );
}