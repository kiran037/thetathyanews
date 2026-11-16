// File: components/main/categories/category-card.tsx
// Reusable category card component

import Link from "next/link";
import { Folder, TrendingUp, Calendar } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface CategoryCardProps {
  category: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    color: string | null;
    icon: string | null;
    coverImageUrl: string | null;
    articleCount: number;
    latestArticleDate: Date | null;
  };
  variant?: "default" | "compact" | "grid";
}

export function CategoryCard({ category, variant = "default" }: CategoryCardProps) {
  const categoryColor = category.color || "#f65200";
  const lastUpdated = category.latestArticleDate
    ? formatDistanceToNow(new Date(category.latestArticleDate), { addSuffix: true })
    : null;

  if (variant === "compact") {
    return (
      <Link
        href={`/categories/${category.slug}`}
        className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent transition-colors group"
      >
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${categoryColor}15` }}
        >
          <Folder className="h-5 w-5" style={{ color: categoryColor }} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm group-hover:text-primary transition-colors truncate">
            {category.name}
          </h3>
          <p className="text-xs text-muted-foreground">
            {category.articleCount} {category.articleCount === 1 ? "article" : "articles"}
          </p>
        </div>
      </Link>
    );
  }

  if (variant === "grid") {
    return (
      <Link
        href={`/categories/${category.slug}`}
        className="block group"
      >
        <div className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-all">
          {/* Cover Image or Color Header */}
          {category.coverImageUrl ? (
            <div className="relative aspect-video w-full overflow-hidden">
              <img
                src={category.coverImageUrl}
                alt={category.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          ) : (
            <div
              className="h-32 flex items-center justify-center"
              style={{ backgroundColor: `${categoryColor}15` }}
            >
              <Folder className="h-12 w-12" style={{ color: categoryColor }} />
            </div>
          )}

          {/* Content */}
          <div className="p-4">
            <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">
              {category.name}
            </h3>
            {category.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {category.description}
              </p>
            )}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                {category.articleCount} articles
              </span>
              {lastUpdated && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {lastUpdated}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Default variant
  return (
    <Link
      href={`/categories/${category.slug}`}
      className="block group"
    >
      <div className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-all">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${categoryColor}15` }}
          >
            <Folder className="h-7 w-7" style={{ color: categoryColor }} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-xl mb-2 group-hover:text-primary transition-colors">
              {category.name}
            </h3>
            {category.description && (
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {category.description}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />
                {category.articleCount} {category.articleCount === 1 ? "article" : "articles"}
              </span>
              {lastUpdated && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Updated {lastUpdated}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}