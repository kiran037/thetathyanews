// File: app/(main)/categories/page.tsx
// All categories page with sorting and filtering

import { Suspense } from "react";
import Link from "next/link";
import { Loader2, Folder, Grid, List } from "lucide-react";
import { CategoryCard } from "@/components/main/categories/category-card";
import { getCategories } from "@/lib/data/categories";

export const metadata = {
  title: "Browse Categories - TheTathyaNews",
  description: "Explore all satirical news categories and topics",
};

interface CategoriesPageProps {
  searchParams: Promise<{
    sort?: string;
    view?: string;
  }>;
}

export default async function CategoriesPage(props: CategoriesPageProps) {
  const searchParams = await props.searchParams;
  
  const sortBy = (searchParams.sort as "name" | "count" | "recent") || "name";
  const viewMode = searchParams.view || "grid";
  
  const data = await getCategories({ sortBy });

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-3 mb-3">
          <Folder className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold">Categories</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Browse articles by category and discover your favorite topics
        </p>
      </div>

      {/* Stats & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{data.total}</span> categories available
        </div>

        <div className="flex items-center gap-3">
          {/* Sort Options */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Sort by:</span>
            <div className="flex gap-1 bg-muted rounded-lg p-1">
              <Link
                href={`?sort=name&view=${viewMode}`}
                className={`px-3 py-1 text-xs rounded-md transition-colors ${
                  sortBy === "name"
                    ? "bg-background text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Name
              </Link>
              <Link
                href={`?sort=count&view=${viewMode}`}
                className={`px-3 py-1 text-xs rounded-md transition-colors ${
                  sortBy === "count"
                    ? "bg-background text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Most Articles
              </Link>
              <Link
                href={`?sort=recent&view=${viewMode}`}
                className={`px-3 py-1 text-xs rounded-md transition-colors ${
                  sortBy === "recent"
                    ? "bg-background text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Recently Updated
              </Link>
            </div>
          </div>

          {/* View Toggle */}
          <div className="flex gap-1 bg-muted rounded-lg p-1">
            <Link
              href={`?sort=${sortBy}&view=grid`}
              className={`p-2 rounded-md transition-colors ${
                viewMode === "grid"
                  ? "bg-background text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              aria-label="Grid view"
            >
              <Grid className="h-4 w-4" />
            </Link>
            <Link
              href={`?sort=${sortBy}&view=list`}
              className={`p-2 rounded-md transition-colors ${
                viewMode === "list"
                  ? "bg-background text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              aria-label="List view"
            >
              <List className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Categories Grid/List */}
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        }
      >
        {data.categories.length === 0 ? (
          <div className="text-center py-12 bg-card border border-border rounded-lg">
            <Folder className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Categories Found</h3>
            <p className="text-muted-foreground">
              Categories will appear here once they are created
            </p>
          </div>
        ) : (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-4"
            }
          >
            {data.categories.map((category: any) => (
              <CategoryCard
                key={category.id}
                category={category}
                variant={viewMode === "grid" ? "grid" : "default"}
              />
            ))}
          </div>
        )}
      </Suspense>
    </div>
  );
}