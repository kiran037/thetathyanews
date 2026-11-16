// File: app/(main)/categories/[slug]/page.tsx
// Single category page with articles and pagination

import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Loader2, Folder, ArrowLeft, TrendingUp } from "lucide-react";
import Link from "next/link";
import { ArticleCard } from "@/components/main/article/article-card";
import { Pagination } from "@/components/ui/pagination";
import { CategoryCard } from "@/components/main/categories/category-card";

import { getCategoryWithArticles, getCategories } from "@/lib/data/categories";

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    page?: string;
  }>;
}

// FIX 4: Await params in generateMetadata
export async function generateMetadata(props: CategoryPageProps) {
  const params = await props.params;
  const data = await getCategoryWithArticles(params.slug, { page: 1, limit: 1 });

  if (!data) {
    return {
      title: "Category Not Found",
    };
  }

  return {
    title: `${data.category.name} - TheTathyaNews`,
    description: data.category.description || `Browse ${data.category.name} articles on TheTathyaNews`,
  };
}

export default async function CategoryPage(props: CategoryPageProps) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  
  const page = parseInt(searchParams.page || "1");
  const data = await getCategoryWithArticles(params.slug, { page, limit: 12 });

  if (!data) {
    notFound();
  }

  const allCategories = await getCategories({ sortBy: "count", limit: 4 });
  const relatedCategories = allCategories.categories.filter((c) => c.id !== data.category.id).slice(0, 3);
  const categoryColor = data.category.color || "#f65200";

  return (
    <div className="max-w-7xl mx-auto">
      {/* Back Navigation */}
      <div className="mb-6">
        <Link
          href="/categories"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          All Categories
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Category Header */}
          <div className="mb-8">
            <div className="flex items-start gap-4 mb-4">
              <div
                className="w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${categoryColor}15` }}
              >
                <Folder className="h-8 w-8" style={{ color: categoryColor }} />
              </div>
              <div className="flex-1">
                <h1 className="text-4xl font-bold mb-2">{data.category.name}</h1>
                {data.category.description && (
                  <p className="text-lg text-muted-foreground">
                    {data.category.description}
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
                <Folder className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Articles Yet</h3>
                <p className="text-muted-foreground">
                  Articles in this category will appear here
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
                      baseUrl={`/categories/${params.slug}`}
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
            {/* Related Categories */}
            {relatedCategories.length > 0 && (
              <div>
                <h3 className="text-lg font-bold mb-4">Other Categories</h3>
                <div className="space-y-3">
                  {relatedCategories.map((category: any) => (
                    <CategoryCard
                      key={category.id}
                      category={category}
                      variant="compact"
                    />
                  ))}
                </div>
                <div className="mt-4">
                  <Link
                    href="/categories"
                    className="text-sm text-primary hover:underline"
                  >
                    View all categories →
                  </Link>
                </div>
              </div>
            )}

            {/* Subscribe CTA */}
            <div className="rounded-lg border border-border bg-gradient-to-br from-primary/5 to-primary/10 p-6 text-center">
              <h4 className="font-bold text-lg mb-2">Love {data.category.name}?</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Get the latest articles delivered to your inbox
              </p>
              <Link href="/pricing" className="btn-primary w-full">
                Subscribe Now
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}