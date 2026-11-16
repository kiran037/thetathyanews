// File: app/(main)/tags/[slug]/page.tsx
// Single tag page with articles and pagination

import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Loader2, Hash, ArrowLeft, TrendingUp } from "lucide-react";
import Link from "next/link";
import { ArticleCard } from "@/components/main/article/article-card";
import { Pagination } from "@/components/ui/pagination";
import { TagCard } from "@/components/main/tags/tag-card";

import { getTagWithArticles, getTags } from "@/lib/data/tags";

interface TagPageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    page?: string;
  }>;
}

export async function generateMetadata(props: TagPageProps) {
  const params = await props.params;
  const data = await getTagWithArticles(params.slug, { page: 1, limit: 1 });

  if (!data) {
    return {
      title: "Tag Not Found",
    };
  }

  return {
    title: `#${data.tag.name} - TheTathyaNews`,
    description: data.tag.description || `Browse articles tagged with #${data.tag.name}`,
  };
}

export default async function TagPage(props: TagPageProps) {
  const params = await props.params;
  const searchParams = await props.searchParams;

  const page = parseInt(searchParams.page || "1");
  const data = await getTagWithArticles(params.slug, { page, limit: 12 });

  if (!data) {
    notFound();
  }

  const allTags = await getTags({ sortBy: "count", limit: 10 });
  const relatedTags = allTags.tags.filter((t) => t.id !== data.tag.id).slice(0, 6);
  // Fallback color since schema doesn't have color for tags
  const tagColor = "#f65200"; 

  return (
    <div className="max-w-7xl mx-auto">
      {/* Back Navigation */}
      <div className="mb-6">
        <Link
          href="/tags"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          All Tags
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Tag Header */}
          <div className="mb-8">
            <div className="flex items-start gap-4 mb-4">
              <div
                className="w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${tagColor}15` }}
              >
                <Hash className="h-8 w-8" style={{ color: tagColor }} />
              </div>
              <div className="flex-1">
                <h1 className="text-4xl font-bold mb-2">#{data.tag.name}</h1>
                {data.tag.description && (
                  <p className="text-lg text-muted-foreground">
                    {data.tag.description}
                  </p>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />
                {data.pagination.total} {data.pagination.total === 1 ? "article" : "articles"}
              </span>
            </div>
          </div>

          {/* Articles */}
          <Suspense
            fallback={
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            }
          >
            {data.articles.length === 0 ? (
              <div className="text-center py-12 bg-card border border-border rounded-lg">
                <Hash className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Articles Yet</h3>
                <p className="text-muted-foreground">
                  Articles tagged with #{data.tag.name} will appear here
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {data.articles.map((article: any) => (
                    <ArticleCard key={article.id} article={article} />
                  ))}
                </div>

                {/* Pagination */}
                {data.pagination.totalPages > 1 && (
                  <div className="mt-8">
                    <Pagination
                      currentPage={data.pagination.page}
                      totalPages={data.pagination.totalPages}
                      baseUrl={`/tags/${params.slug}`}
                    />
                  </div>
                )}
              </>
            )}
          </Suspense>
        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-1">
          <div className="sticky top-20 space-y-8">
            {/* Related Tags */}
            {relatedTags.length > 0 && (
              <div>
                <h3 className="text-lg font-bold mb-4">Related Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {relatedTags.map((tag: any) => (
                    <TagCard
                      key={tag.id}
                      tag={tag}
                      variant="compact"
                      showCount={true}
                    />
                  ))}
                </div>
                <div className="mt-4">
                  <Link
                    href="/tags"
                    className="text-sm text-primary hover:underline"
                  >
                    View all tags →
                  </Link>
                </div>
              </div>
            )}

            {/* Browse by Category */}
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="font-bold text-lg mb-3">Browse by Category</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Explore articles organized by categories
              </p>
              <Link href="/categories" className="btn-secondary w-full">
                View Categories
              </Link>
            </div>

            {/* Subscribe CTA */}
            <div className="rounded-lg border border-border bg-gradient-to-br from-primary/5 to-primary/10 p-6 text-center">
              <h4 className="font-bold text-lg mb-2">Follow #{data.tag.name}</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Get notified about new articles with this tag
              </p>
              <Link href="/pricing" className="btn-primary w-full">
                Subscribe
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}