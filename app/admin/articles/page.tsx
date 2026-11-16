// File: app/admin/articles/page.tsx
import Link from "next/link";
import { PlusCircle, Search, Filter, Eye, MessageSquare, ExternalLink, Trash2 } from "lucide-react";
import { getAdminArticles } from "@/lib/data/admin";
import { getCategories } from "@/lib/data/categories";
import { Pagination } from "@/components/ui/pagination";
import { AdminArticleActions } from "./actions-client";

export const metadata = {
  title: "Article Management - TheTathyaNews Admin",
  description: "Manage, edit, publish, and inspect all articles",
};

interface AdminArticlesProps {
  searchParams: Promise<{
    page?: string;
    q?: string;
    status?: string;
    category?: string;
  }>;
}

export default async function AdminArticlesPage(props: AdminArticlesProps) {
  const searchParams = await props.searchParams;
  const page = parseInt(searchParams.page || "1");
  const query = searchParams.q || "";
  const status = searchParams.status || "all";
  const category = searchParams.category || "all";

  const [articlesData, categoriesData] = await Promise.all([
    getAdminArticles({ page, limit: 12, query, status, category }),
    getCategories(),
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Articles</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Total {articlesData.total} articles in the publication archive
          </p>
        </div>
        <Link
          href="/admin/articles/new"
          className="btn-primary inline-flex items-center gap-2 px-4 py-2 text-sm"
        >
          <PlusCircle className="h-4 w-4" />
          Create Article
        </Link>
      </div>

      {/* Filter Controls Bar */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <form method="GET" className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Search by title or slug..."
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex gap-2">
            <select
              name="status"
              defaultValue={status}
              className="px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Statuses</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>

            <select
              name="category"
              defaultValue={category}
              className="px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Categories</option>
              {categoriesData.categories.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>

            <button type="submit" className="btn-secondary px-4 py-2 text-sm">
              Filter
            </button>
          </div>
        </form>
      </div>

      {/* Articles Table */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-muted-foreground text-xs uppercase">
                <th className="py-3 px-4 font-semibold">Title & Details</th>
                <th className="py-3 px-4 font-semibold">Category</th>
                <th className="py-3 px-4 font-semibold">Author</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-center">Stats</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {articlesData.articles.length > 0 ? (
                articlesData.articles.map((art) => (
                  <tr key={art.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3.5 px-4 max-w-md">
                      <p className="font-medium text-foreground line-clamp-1">{art.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        /{art.slug} · Created {new Date(art.createdAt).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="py-3.5 px-4 text-xs whitespace-nowrap">
                      {art.categoryName ? (
                        <span className="px-2 py-0.5 rounded bg-muted text-muted-foreground font-medium">
                          {art.categoryName}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-muted-foreground whitespace-nowrap">
                      {art.authorName || "Editorial Staff"}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                          art.status === "published"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : art.status === "draft"
                            ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {art.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1" title="Views">
                          <Eye className="h-3.5 w-3.5" />
                          {art.viewCount?.toLocaleString() || 0}
                        </span>
                        <span className="flex items-center gap-1" title="Comments">
                          <MessageSquare className="h-3.5 w-3.5" />
                          {art.commentCount || 0}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <AdminArticleActions
                        articleId={art.id}
                        slug={art.slug}
                        currentStatus={art.status}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted-foreground">
                    No articles found matching the current criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {articlesData.totalPages > 1 && (
          <div className="p-4 border-t border-border flex justify-center">
            <Pagination
              currentPage={page}
              totalPages={articlesData.totalPages}
              baseUrl={`/admin/articles?q=${encodeURIComponent(query)}&status=${status}&category=${category}`}
            />
          </div>
        )}
      </div>
    </div>
  );
}
