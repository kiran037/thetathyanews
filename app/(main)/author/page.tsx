// File: app/(main)/author/page.tsx
// All authors page with sorting, filtering, and grid/list views

import { Suspense } from "react";
import Link from "next/link";
import { Loader2, Users, Grid, List, Award, CheckCircle } from "lucide-react";
import { AuthorCard } from "@/components/main/authors/author-card";
import { getAuthors } from "@/lib/data/authors";

export const metadata = {
  title: "Our Authors - TheTathyaNews",
  description: "Meet our talented team of satirical news writers and contributors",
};

// Interface for Next.js 15 (searchParams is a Promise)
interface AuthorsPageProps {
  searchParams: Promise<{
    sort?: string;
    view?: string;
    filter?: string;
  }>;
}

export default async function AuthorsPage(props: AuthorsPageProps) {
  const searchParams = await props.searchParams;
  
  const sortBy = (searchParams.sort as "articles" | "name" | "recent" | "views") || "articles";
  const viewMode = searchParams.view || "grid";
  const filter = searchParams.filter;
  
  const data = await getAuthors({
    sortBy,
    staffOnly: filter === "staff",
    verifiedOnly: filter === "verified",
  });

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-3 mb-3">
          <Users className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold">Our Authors</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Meet the talented writers behind TheTathyaNews satirical content
        </p>
      </div>

      {/* Stats & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{data.total}</span> {filter === "staff" ? "staff " : filter === "verified" ? "verified " : ""}authors
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Filter Options */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Filter:</span>
            <div className="flex gap-1 bg-muted rounded-lg p-1">
              <Link
                href={`?sort=${sortBy}&view=${viewMode}`}
                className={`px-3 py-1 text-xs rounded-md transition-colors ${
                  !filter
                    ? "bg-background text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                All
              </Link>
              <Link
                href={`?sort=${sortBy}&view=${viewMode}&filter=staff`}
                className={`px-3 py-1 text-xs rounded-md transition-colors flex items-center gap-1 ${
                  filter === "staff"
                    ? "bg-background text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Award className="h-3 w-3" />
                Staff
              </Link>
              <Link
                href={`?sort=${sortBy}&view=${viewMode}&filter=verified`}
                className={`px-3 py-1 text-xs rounded-md transition-colors flex items-center gap-1 ${
                  filter === "verified"
                    ? "bg-background text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <CheckCircle className="h-3 w-3" />
                Verified
              </Link>
            </div>
          </div>

          {/* Sort Options */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Sort by:</span>
            <div className="flex gap-1 bg-muted rounded-lg p-1">
              <Link
                href={`?sort=articles&view=${viewMode}${filter ? `&filter=${filter}` : ""}`}
                className={`px-3 py-1 text-xs rounded-md transition-colors ${
                  sortBy === "articles"
                    ? "bg-background text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Most Articles
              </Link>
              <Link
                href={`?sort=views&view=${viewMode}${filter ? `&filter=${filter}` : ""}`}
                className={`px-3 py-1 text-xs rounded-md transition-colors ${
                  sortBy === "views"
                    ? "bg-background text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Most Views
              </Link>
              <Link
                href={`?sort=name&view=${viewMode}${filter ? `&filter=${filter}` : ""}`}
                className={`px-3 py-1 text-xs rounded-md transition-colors ${
                  sortBy === "name"
                    ? "bg-background text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Name
              </Link>
            </div>
          </div>

          {/* View Toggle */}
          <div className="flex gap-1 bg-muted rounded-lg p-1">
            <Link
              href={`?sort=${sortBy}&view=grid${filter ? `&filter=${filter}` : ""}`}
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
              href={`?sort=${sortBy}&view=list${filter ? `&filter=${filter}` : ""}`}
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

      {/* Authors Grid/List */}
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        }
      >
        {data.authors.length === 0 ? (
          <div className="text-center py-12 bg-card border border-border rounded-lg">
            <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Authors Found</h3>
            <p className="text-muted-foreground">
              {filter ? `No ${filter} authors found. Try removing filters.` : "Authors will appear here once added"}
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
            {data.authors.map((author: any) => (
              <AuthorCard
                key={author.id}
                author={author}
                variant={viewMode === "grid" ? "grid" : "default"}
                showStats={true}
              />
            ))}
          </div>
        )}
      </Suspense>
    </div>
  );
}