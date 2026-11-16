// File: app/(main)/article/page.tsx
// Article feed page - shows all published articles with pagination

import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { ArticleCard } from "@/components/main/article/article-card";
import { Pagination } from "@/components/ui/pagination";

import { getArticles } from "@/lib/data/articles";

export const metadata = {
  title: "Articles - TheTathyaNews",
  description: "Browse all satirical news articles",
};

interface ArticleFeedProps {
  searchParams: Promise<{
    page?: string;
    category?: string;
  }>;
}

export default async function ArticleFeedPage(props: ArticleFeedProps) {
  const searchParams = await props.searchParams;
  const page = parseInt(searchParams.page || "1");
  const category = searchParams.category;

  const data = await getArticles({ page, category, limit: 12 });

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">
          {category ? `${category} Articles` : "All Articles"}
        </h1>
        <p className="text-muted-foreground">
          Discover our latest satirical news and commentary
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
            <h3 className="text-xl font-semibold mb-2">No Articles Found</h3>
            <p className="text-muted-foreground">
              Check back later for new content
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.articles.map((article: any) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>

            {/* Pagination */}
            {data.pagination.totalPages > 1 && (
              <Pagination
                currentPage={data.pagination.page}
                totalPages={data.pagination.totalPages}
                baseUrl={`/article${category ? `?category=${category}` : ""}`}
              />
            )}
          </>
        )}
      </Suspense>
    </div>
  );
}