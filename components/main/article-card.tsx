"use client";

import Link from "next/link";
import { Clock, User, MessageCircle, Eye } from "lucide-react";
import Image from "next/image";

interface ArticleCardProps {
  article: {
    id: string;
    slug: string;
    title: string;
    excerpt?: string | null;
    coverImageUrl?: string | null;
    readingTimeMinutes?: number | null;
    // UPDATED: Allow null here
    viewCount?: number | null; 
    // UPDATED: Allow null here
    commentCount?: number | null;
    categoryName?: string | null;
    categorySlug?: string | null;
    authorName?: string | null;
    authorSlug?: string | null;
    publishedAt?: Date | null;
  };
  priority?: boolean;
}

export function ArticleCard({ article, priority = false }: ArticleCardProps) {
  const articleUrl = `/article/${article.slug}`;

  // Helper to handle nulls safely
  const viewCount = article.viewCount ?? 0;
  const commentCount = article.commentCount ?? 0;

  return (
    <Link href={articleUrl}>
      <article className="article-card">
        {/* Cover Image */}
        <div className="relative h-48 w-full bg-muted overflow-hidden">
          {article.coverImageUrl ? (
            <Image
              src={article.coverImageUrl}
              alt={article.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              priority={priority}
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5" />
          )}
        </div>

        <div className="article-card-content">
          {/* Category Badge */}
          {article.categoryName && (
            <span className="article-card-category">
              {article.categoryName.toUpperCase()}
            </span>
          )}

          {/* Title */}
          <h3 className="article-card-title">{article.title}</h3>

          {/* Excerpt */}
          {article.excerpt && (
            <p className="article-card-excerpt">{article.excerpt}</p>
          )}

          {/* Meta Information */}
          <div className="article-card-meta">
            {article.authorName && (
              <div className="flex items-center gap-2">
                <User className="h-3 w-3" />
                <span>{article.authorName}</span>
              </div>
            )}
            
            {article.readingTimeMinutes && (
              <div className="flex items-center gap-2">
                <Clock className="h-3 w-3" />
                <span>{article.readingTimeMinutes} min</span>
              </div>
            )}

            {viewCount > 0 && (
              <div className="flex items-center gap-2">
                <Eye className="h-3 w-3" />
                <span>{formatNumber(viewCount)}</span>
              </div>
            )}

            {commentCount > 0 && (
              <div className="flex items-center gap-2">
                <MessageCircle className="h-3 w-3" />
                <span>{commentCount}</span>
              </div>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}

function formatNumber(num: number): string {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toString();
}