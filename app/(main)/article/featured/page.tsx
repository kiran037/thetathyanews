// File: app/(main)/article/featured/page.tsx
// Featured articles page - shows editor's picks

import { Suspense } from "react";
import { Loader2, Star } from "lucide-react";
import { ArticleCard } from "@/components/main/article/article-card";
import { Pagination } from "@/components/ui/pagination";

import { getArticles } from "@/lib/data/articles";

export const metadata = {
  title: "Featured Articles - TheTathyaNews",
  description: "Our handpicked featured articles",
};

interface FeaturedPageProps {
  searchParams: Promise<{
    page?: string;
  }>;
}

export default async function FeaturedPage(props: FeaturedPageProps) {
  const searchParams = await props.searchParams;
  const page = parseInt(searchParams.page || "1");
  const data = await getArticles({ page, featured: true, limit: 12 });

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <Star className="h-8 w-8 text-primary fill-primary" />
          <h1 className="text-3xl font-bold">Featured Articles</h1>
        </div>
        <p className="text-muted-foreground">
          Our editors&apos; picks of the best satirical content
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
            <Star className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Featured Articles Yet</h3>
            <p className="text-muted-foreground">
              Check back soon for editor&apos;s picks
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.articles.map((article: any) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>

            {data.pagination.totalPages > 1 && (
              <Pagination
                currentPage={data.pagination.page}
                totalPages={data.pagination.totalPages}
                baseUrl="/article/featured"
              />
            )}
          </>
        )}
      </Suspense>
    </div>
  );
}