// File: components/main/authors/author-card.tsx
"use client"; 
import Link from "next/link";
import { User, BookOpen, Eye, CheckCircle, Award } from "lucide-react";

interface AuthorCardProps {
  author: {
    id: string;
    slug: string;
    displayName: string;
    bio: string | null;
    avatarUrl: string | null;
    title: string | null;
    isVerified: boolean | null;
    isStaff: boolean | null;
    // Allow for potential string/number mismatches from API
    articleCount: number | string | null; 
    totalViews?: number | string;
  };
  variant?: "default" | "compact" | "grid";
  showStats?: boolean;
}

export function AuthorCard({ author, variant = "default", showStats = true }: AuthorCardProps) {
  // 1. Defensively cast stats to numbers to prevent "0" string glitches
  const articleCount = Number(author.articleCount || 0);
  const totalViews = author.totalViews ? Number(author.totalViews) : 0;

  // Compact Variant (Sidebar/Lists)
  if (variant === "compact") {
    return (
      <Link
        href={`/author/${author.slug}`}
        className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors group"
      >
        {/* Avatar */}
        {author.avatarUrl ? (
          <img
            src={author.avatarUrl}
            alt={author.displayName}
            className="w-12 h-12 rounded-full flex-shrink-0 object-cover bg-muted"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <User className="h-6 w-6 text-primary" />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm group-hover:text-primary transition-colors truncate">
              {author.displayName}
            </h3>
            {author.isVerified && (
              <CheckCircle className="h-4 w-4 text-primary fill-primary flex-shrink-0" />
            )}
            {author.isStaff && (
              <Award className="h-4 w-4 text-yellow-500 flex-shrink-0" />
            )}
          </div>
          {author.title && (
            <p className="text-xs text-muted-foreground truncate">{author.title}</p>
          )}
          {showStats && (
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
              <span>{articleCount} articles</span>
            </p>
          )}
        </div>
      </Link>
    );
  }

  // Grid Variant (Authors Index Page)
  if (variant === "grid") {
    return (
      <Link
        href={`/author/${author.slug}`}
        className="block group h-full"
      >
        <div className="h-full bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg hover:border-primary/20 transition-all p-6 text-center flex flex-col">
          {/* Avatar */}
          {author.avatarUrl ? (
            <img
              src={author.avatarUrl}
              alt={author.displayName}
              className="w-24 h-24 rounded-full mx-auto mb-4 object-cover group-hover:scale-105 transition-transform bg-muted"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <User className="h-12 w-12 text-primary" />
            </div>
          )}

          {/* Name & Badges */}
          <div className="flex items-center justify-center gap-2 mb-1">
            <h3 className="font-bold text-lg group-hover:text-primary transition-colors line-clamp-1">
              {author.displayName}
            </h3>
            {author.isVerified && (
              <CheckCircle className="h-5 w-5 text-primary fill-primary flex-shrink-0" />
            )}
            {author.isStaff && (
              <Award className="h-5 w-5 text-yellow-500 flex-shrink-0" />
            )}
          </div>

          {/* Title */}
          {author.title && (
            <p className="text-sm text-muted-foreground mb-3 line-clamp-1">{author.title}</p>
          )}

          {/* Bio */}
          {author.bio && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-grow">
              {author.bio}
            </p>
          )}

          {/* Stats */}
          {showStats && (
            <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground mt-auto pt-4 border-t border-border/50">
              <span className="flex items-center gap-1">
                <BookOpen className="h-3.5 w-3.5" />
                {articleCount}
              </span>
              {totalViews > 0 && (
                <span className="flex items-center gap-1">
                  <Eye className="h-3.5 w-3.5" />
                  {totalViews.toLocaleString()}
                </span>
              )}
            </div>
          )}
        </div>
      </Link>
    );
  }

  // Default Variant (Search results, Wide cards)
  return (
    <Link
      href={`/author/${author.slug}`}
      className="block group"
    >
      <div className="bg-card border border-border rounded-lg p-6 hover:shadow-lg hover:border-primary/20 transition-all">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          {author.avatarUrl ? (
            <img
              src={author.avatarUrl}
              alt={author.displayName}
              className="w-20 h-20 rounded-full flex-shrink-0 object-cover bg-muted"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <User className="h-10 w-10 text-primary" />
            </div>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-xl group-hover:text-primary transition-colors">
                {author.displayName}
              </h3>
              {author.isVerified && (
                <CheckCircle className="h-5 w-5 text-primary fill-primary flex-shrink-0" />
              )}
              {author.isStaff && (
                <Award className="h-5 w-5 text-yellow-500 flex-shrink-0" />
              )}
            </div>

            {author.title && (
              <p className="text-sm text-muted-foreground mb-2">{author.title}</p>
            )}

            {author.bio && (
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {author.bio}
              </p>
            )}

            {/* Stats */}
            {showStats && (
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  {articleCount} {articleCount === 1 ? "article" : "articles"}
                </span>
                {totalViews > 0 && (
                  <span className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {totalViews.toLocaleString()} views
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}