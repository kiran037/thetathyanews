// File: app/(main)/tags/page.tsx
// All tags page with tag cloud and sorting

import { Suspense } from "react";
import Link from "next/link";
import { Loader2, Hash, Cloud, Grid } from "lucide-react";
import { TagCard } from "@/components/main/tags/tag-card";
import { getTags } from "@/lib/data/tags";

export const metadata = {
  title: "Browse Tags - TheTathyaNews",
  description: "Explore all tags and discover trending topics",
};

interface TagsPageProps {
  searchParams: Promise<{
    sort?: string;
    view?: string;
    min?: string;
  }>;
}

export default async function TagsPage(props: TagsPageProps) {
  const searchParams = await props.searchParams;
  
  const sortBy = (searchParams.sort as "count" | "recent" | "name") || "count";
  const viewMode = searchParams.view || "cloud";
  const minCount = parseInt(searchParams.min || "1");
  
  const data = await getTags({ sortBy, minCount });

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-3 mb-3">
          <Hash className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold">Tags</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Discover topics and explore articles by tags
        </p>
      </div>

      {/* Stats & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{data.total}</span> tags available
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Minimum Articles Filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Min articles:</span>
            <div className="flex gap-1 bg-muted rounded-lg p-1">
              <Link
                href={`?sort=${sortBy}&view=${viewMode}&min=1`}
                className={`px-3 py-1 text-xs rounded-md transition-colors ${
                  minCount === 1
                    ? "bg-background text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                All
              </Link>
              <Link
                href={`?sort=${sortBy}&view=${viewMode}&min=5`}
                className={`px-3 py-1 text-xs rounded-md transition-colors ${
                  minCount === 5
                    ? "bg-background text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                5+
              </Link>
              <Link
                href={`?sort=${sortBy}&view=${viewMode}&min=10`}
                className={`px-3 py-1 text-xs rounded-md transition-colors ${
                  minCount === 10
                    ? "bg-background text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                10+
              </Link>
            </div>
          </div>

          {/* Sort Options */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Sort by:</span>
            <div className="flex gap-1 bg-muted rounded-lg p-1">
              <Link
                href={`?sort=count&view=${viewMode}&min=${minCount}`}
                className={`px-3 py-1 text-xs rounded-md transition-colors ${
                  sortBy === "count"
                    ? "bg-background text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Popular
              </Link>
              <Link
                href={`?sort=name&view=${viewMode}&min=${minCount}`}
                className={`px-3 py-1 text-xs rounded-md transition-colors ${
                  sortBy === "name"
                    ? "bg-background text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Name
              </Link>
              <Link
                href={`?sort=recent&view=${viewMode}&min=${minCount}`}
                className={`px-3 py-1 text-xs rounded-md transition-colors ${
                  sortBy === "recent"
                    ? "bg-background text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Recent
              </Link>
            </div>
          </div>

          {/* View Toggle */}
          <div className="flex gap-1 bg-muted rounded-lg p-1">
            <Link
              href={`?sort=${sortBy}&view=cloud&min=${minCount}`}
              className={`p-2 rounded-md transition-colors ${
                viewMode === "cloud"
                  ? "bg-background text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              aria-label="Cloud view"
            >
              <Cloud className="h-4 w-4" />
            </Link>
            <Link
              href={`?sort=${sortBy}&view=grid&min=${minCount}`}
              className={`p-2 rounded-md transition-colors ${
                viewMode === "grid"
                  ? "bg-background text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              aria-label="Grid view"
            >
              <Grid className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Tags Display */}
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        }
      >
        {data.tags.length === 0 ? (
          <div className="text-center py-12 bg-card border border-border rounded-lg">
            <Hash className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Tags Found</h3>
            <p className="text-muted-foreground">
              {minCount > 1
                ? `No tags with ${minCount}+ articles found. Try lowering the filter.`
                : "Tags will appear here once articles are tagged"}
            </p>
          </div>
        ) : (
          <>
            {viewMode === "cloud" ? (
              <div className="bg-card border border-border rounded-lg p-8">
                <div className="flex flex-wrap gap-3 justify-center items-center">
                  {data.tags.map((tag: any) => (
                    <TagCard key={tag.id} tag={tag} variant="cloud" />
                  ))}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.tags.map((tag: any) => (
                  <TagCard key={tag.id} tag={tag} variant="default" />
                ))}
              </div>
            )}
          </>
        )}
      </Suspense>

      {/* Popular Tags Section */}
      {data.tags.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Top 10 Tags</h2>
          <div className="flex flex-wrap gap-2">
            {data.tags.slice(0, 10).map((tag: any) => (
              <TagCard key={tag.id} tag={tag} variant="compact" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}