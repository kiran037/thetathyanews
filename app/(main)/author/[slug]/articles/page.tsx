// File: app/(main)/author/[slug]/articles/page.tsx
// All articles by a specific author with pagination

import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Loader2, BookOpen, ArrowLeft, User } from "lucide-react";
import Link from "next/link";
import { ArticleCard } from "@/components/main/article/article-card";
import { Pagination } from "@/components/ui/pagination";

import { getAuthorWithArticles } from "@/lib/data/authors";

// FIX 1: Update interface for Next.js 15 (Promises)
interface AuthorArticlesPageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    page?: string;
  }>;
}

// FIX 3: Await params in generateMetadata
export async function generateMetadata(props: AuthorArticlesPageProps) {
  const params = await props.params;
  const data = await getAuthorWithArticles(params.slug, { page: 1, limit: 1 });

  if (!data) {
    return {
      title: "Articles Not Found",
    };
  }

  return {
    title: `Articles by ${data.author.displayName} - TheTathyaNews`,
    description: `Read all articles by ${data.author.displayName} on TheTathyaNews`,
  };
}

// FIX 4: Await params and searchParams in the component
export default async function AuthorArticlesPage(props: AuthorArticlesPageProps) {
  const params = await props.params;
  const searchParams = await props.searchParams;

  const page = parseInt(searchParams.page || "1");
  const data = await getAuthorWithArticles(params.slug, { page, limit: 12 });

  if (!data) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Back Navigation */}
      <div className="mb-6">
        <Link
          href={`/author/${params.slug}`}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to profile
        </Link>
      </div>

      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-start gap-4 mb-4">
          {/* Author Avatar */}
          {data.author.avatarUrl ? (
            <img
              src={data.author.avatarUrl}
              alt={data.author.displayName}
              className="w-16 h-16 rounded-full object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <User className="h-8 w-8 text-primary" />
            </div>
          )}

          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-2">
              Articles by {data.author.displayName}
            </h1>
            {data.author.title && (
              <p className="text-lg text-muted-foreground">{data.author.title}</p>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <BookOpen className="h-4 w-4" />
            {data.pagination.total} {data.pagination.total === 1 ? "article" : "articles"} published
          </span>
        </div>
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
          <div className="text-center py-12 bg-card border border-border rounded-lg">
            <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Articles Found</h3>
            <p className="text-muted-foreground">
              {data.author.displayName} hasn&apos;t published any articles yet
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
              <div className="mt-8">
                <Pagination
                  currentPage={data.pagination.page}
                  totalPages={data.pagination.totalPages}
                  baseUrl={`/author/${params.slug}/articles`}
                />
              </div>
            )}
          </>
        )}
      </Suspense>
    </div>
  );
}