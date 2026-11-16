// File: app/(main)/search/page.tsx
import { Suspense } from "react";
import { Search as SearchIcon, Loader2 } from "lucide-react";
import { db } from "@/db";
import { articles, categories, authors } from "@/db/schema";
import { ArticleCard } from "@/components/main/article-card";
import { SearchFilters } from "@/components/main/search-filters";
import { Pagination } from "@/components/ui/pagination";
import { eq, and, or, sql, desc, SQL } from "drizzle-orm";

export const metadata = {
  title: "Search - TheTathyaNews",
  description: "Search for satirical news and articles",
};

// 1. Fix: searchParams is a Promise in Next.js 15
interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    author?: string;
    page?: string;
  }>;
}

// Helper: Fetch filters
async function getFilters() {
  const [cats, auths] = await Promise.all([
    db.select({ name: categories.name, slug: categories.slug }).from(categories).orderBy(categories.name),
    db.select({ displayName: authors.displayName, slug: authors.slug }).from(authors).orderBy(authors.displayName),
  ]);
  return { categories: cats, authors: auths };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  // 2. Fix: Await searchParams
  const params = await searchParams;
  
  const query = params.q || "";
  const categorySlug = params.category;
  const authorSlug = params.author;
  const page = parseInt(params.page || "1");
  const limit = 12;
  const offset = (page - 1) * limit;

  // 3. Logic: Build DB Query directly (No Fetch)
  const conditions: SQL[] = [
    eq(articles.status, "published"),
    eq(articles.visibility, "public"),
    sql`${articles.deletedAt} IS NULL`
  ];

  // Text Search
  if (query) {
    const searchTerm = `%${query.toLowerCase()}%`;
    conditions.push(
      or(
        sql`LOWER(${articles.title}) LIKE ${searchTerm}`,
        sql`LOWER(${articles.excerpt}) LIKE ${searchTerm}`,
        sql`LOWER(${articles.content}) LIKE ${searchTerm}`
      )!
    );
  }

  // Category Filter
  if (categorySlug) {
    const cat = await db.query.categories.findFirst({
      where: eq(categories.slug, categorySlug),
      columns: { id: true }
    });
    if (cat) conditions.push(eq(articles.categoryId, cat.id));
  }

  // Author Filter
  if (authorSlug) {
    const auth = await db.query.authors.findFirst({
      where: eq(authors.slug, authorSlug),
      columns: { id: true }
    });
    if (auth) conditions.push(eq(articles.primaryAuthorId, auth.id));
  }

  // 4. Execute Queries
  // We run Filter fetching + Search Query + Count Query in parallel
  const [filterData, results, countResult] = await Promise.all([
    getFilters(),
    
    // Search Query
    db.select({
      id: articles.id,
      slug: articles.slug,
      title: articles.title,
      excerpt: articles.excerpt,
      coverImageUrl: articles.coverImageUrl,
      publishedAt: articles.publishedAt,
      readingTimeMinutes: articles.readingTimeMinutes,
      viewCount: articles.viewCount,
      commentCount: articles.commentCount,
      categoryName: categories.name,
      categorySlug: categories.slug,
      authorName: authors.displayName,
      authorSlug: authors.slug,
    })
    .from(articles)
    .leftJoin(categories, eq(articles.categoryId, categories.id))
    .leftJoin(authors, eq(articles.primaryAuthorId, authors.id))
    .where(and(...conditions))
    .orderBy(desc(articles.publishedAt))
    .limit(limit)
    .offset(offset),

    // Count Query
    db.select({ count: sql<number>`cast(count(*) as int)` })
      .from(articles)
      .where(and(...conditions))
  ]);

  const total = countResult[0]?.count || 0;
  const totalPages = Math.ceil(total / limit);

  // 5. Transform for UI
  const formattedResults = results.map(r => ({
    id: r.id,
    slug: r.slug,
    title: r.title,
    excerpt: r.excerpt,
    coverImageUrl: r.coverImageUrl,
    publishedAt: r.publishedAt,
    readingTimeMinutes: r.readingTimeMinutes,
    viewCount: r.viewCount,
    commentCount: r.commentCount,
    category: r.categoryName ? { name: r.categoryName, slug: r.categorySlug } : null,
    primaryAuthor: r.authorName ? { displayName: r.authorName, slug: r.authorSlug } : null,
  }));

  const hasQuery = query || categorySlug || authorSlug;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold mb-4">Search Articles</h1>
        
        {query && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <SearchIcon className="h-4 w-4" />
            <span>
              Showing results for <strong className="text-foreground">"{query}"</strong>
            </span>
          </div>
        )}
        
        {total > 0 && (
          <p className="text-sm text-muted-foreground mt-2">
            Found {total} {total === 1 ? "article" : "articles"}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <aside className="lg:col-span-1">
          <div className="sticky top-24">
            <SearchFilters
              categories={filterData.categories}
              authors={filterData.authors}
            />
          </div>
        </aside>

        {/* Results */}
        <div className="lg:col-span-3">
          <Suspense fallback={<div className="flex justify-center py-12"><Loader2 className="animate-spin" /></div>}>
            {!hasQuery && formattedResults.length === 0 ? (
              <div className="text-center py-12 border border-dashed rounded-lg">
                <SearchIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-1">Start Your Search</h3>
                <p className="text-muted-foreground">Select a category or type a keyword.</p>
              </div>
            ) : formattedResults.length === 0 ? (
              <div className="text-center py-12 border border-dashed rounded-lg">
                <h3 className="text-lg font-semibold mb-1">No Results Found</h3>
                <p className="text-muted-foreground">Try adjusting your filters.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {formattedResults.map((article: any) => (
                    <ArticleCard key={article.id} article={article} />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="mt-8">
                    <Pagination
                      currentPage={page}
                      totalPages={totalPages}
                      baseUrl={`/search?${new URLSearchParams({
                        ...(query && { q: query }),
                        ...(categorySlug && { category: categorySlug }),
                        ...(authorSlug && { author: authorSlug }),
                      }).toString()}`}
                    />
                  </div>
                )}
              </>
            )}
          </Suspense>
        </div>
      </div>
    </div>
  );
}