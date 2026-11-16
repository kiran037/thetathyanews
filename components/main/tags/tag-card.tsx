// File: components/main/tags/tag-card.tsx
// Reusable tag card component

import Link from "next/link";
import { Tag, Hash, TrendingUp } from "lucide-react";

interface TagCardProps {
  tag: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    color: string | null;
    articleCount: number;
  };
  variant?: "default" | "compact" | "cloud";
  showCount?: boolean;
}

export function TagCard({ tag, variant = "default", showCount = true }: TagCardProps) {
  const tagColor = tag.color || "#f65200";

  if (variant === "cloud") {
    // Tag cloud style - size based on article count
    const fontSize = Math.min(Math.max(tag.articleCount / 10, 0.875), 1.5);
    
    return (
      <Link
        href={`/tags/${tag.slug}`}
        className="inline-block px-3 py-1.5 rounded-full border border-border hover:bg-accent transition-all hover:scale-105"
        style={{ fontSize: `${fontSize}rem` }}
      >
        <span className="font-medium" style={{ color: tagColor }}>
          #{tag.name}
        </span>
        {showCount && (
          <span className="ml-1.5 text-xs text-muted-foreground">
            ({tag.articleCount})
          </span>
        )}
      </Link>
    );
  }

  if (variant === "compact") {
    return (
      <Link
        href={`/tags/${tag.slug}`}
        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border hover:bg-accent transition-colors group"
      >
        <Hash className="h-4 w-4 flex-shrink-0" style={{ color: tagColor }} />
        <span className="font-medium text-sm group-hover:text-primary transition-colors">
          {tag.name}
        </span>
        {showCount && (
          <span className="text-xs text-muted-foreground">
            {tag.articleCount}
          </span>
        )}
      </Link>
    );
  }

  // Default variant
  return (
    <Link
      href={`/tags/${tag.slug}`}
      className="block group"
    >
      <div className="bg-card border border-border rounded-lg p-5 hover:shadow-lg transition-all">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${tagColor}15` }}
          >
            <Hash className="h-5 w-5" style={{ color: tagColor }} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors">
              #{tag.name}
            </h3>
            {tag.description && (
              <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                {tag.description}
              </p>
            )}
            {showCount && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <TrendingUp className="h-3.5 w-3.5" />
                <span>
                  {tag.articleCount} {tag.articleCount === 1 ? "article" : "articles"}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}