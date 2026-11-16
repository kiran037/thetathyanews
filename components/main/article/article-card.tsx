// File: components/main/article/article-card.tsx
// Reusable article card component with default and compact variants

import Link from "next/link";
import { Clock, User, MessageCircle, Eye } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ArticleCardProps {
  article: {
    id: string;
    slug: string;
    title: string;
    excerpt: string | null;
    coverImageUrl: string | null;
    publishedAt: Date | null;
    viewCount: number | null;
    commentCount: number | null;
    readingTimeMinutes: number | null;
    category: {
      name: string;
      slug: string;
    } | null;
    primaryAuthor: {
      displayName: string;
      slug: string;
      avatarUrl: string | null;
    } | null;
  };
  variant?: "default" | "compact";
}

export function ArticleCard({ article, variant = "default" }: ArticleCardProps) {
  const timeAgo = article.publishedAt
    ? formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })
    : null;

  if (variant === "compact") {
    return (
      <Link href={`/article/${article.slug}`} className="group block">
        <div className="flex gap-4">
          {article.coverImageUrl && (
            <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
              <img
                src={article.coverImageUrl}
                alt={article.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            {article.category && (
              <span className="inline-block px-2 py-0.5 text-xs font-semibold text-primary bg-primary/10 rounded mb-1">
                {article.category.name}
              </span>
            )}
            <h3 className="text-sm font-semibold line-clamp-2 group-hover:text-primary transition-colors mb-1">
              {article.title}
            </h3>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {timeAgo && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {timeAgo}
                </span>
              )}
              {article.viewCount !== null && (
                <span className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  {article.viewCount}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/article/${article.slug}`}>
      <article className="article-card">
        {article.coverImageUrl && (
          <div className="relative aspect-video w-full bg-muted">
            <img
              src={article.coverImageUrl}
              alt={article.title}
              className="article-card-image"
            />
          </div>
        )}
        <div className="article-card-content">
          {article.category && (
            <span className="article-card-category">{article.category.name}</span>
          )}
          <h3 className="article-card-title">{article.title}</h3>
          {article.excerpt && <p className="article-card-excerpt">{article.excerpt}</p>}
          <div className="article-card-meta">
            {article.primaryAuthor && (
              <div className="flex items-center gap-2">
                <User className="h-3 w-3" />
                <span>{article.primaryAuthor.displayName}</span>
              </div>
            )}
            {article.readingTimeMinutes && (
              <div className="flex items-center gap-2">
                <Clock className="h-3 w-3" />
                <span>{article.readingTimeMinutes} min</span>
              </div>
            )}
            {article.commentCount !== null && article.commentCount > 0 && (
              <div className="flex items-center gap-2">
                <MessageCircle className="h-3 w-3" />
                <span>{article.commentCount}</span>
              </div>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}