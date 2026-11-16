"use client";

import Link from "next/link";
import { Clock, User, MessageCircle } from "lucide-react";
import Image from "next/image";

interface FeaturedArticleProps {
  article: {
    id: string;
    slug: string;
    title: string;
    excerpt?: string | null;
    coverImageUrl?: string | null;
    readingTimeMinutes?: number | null;
    // UPDATED: Allow null here
    commentCount?: number | null;
    categoryName?: string | null;
    authorName?: string | null;
  };
}

export function FeaturedArticle({ article }: FeaturedArticleProps) {
  // Helper to handle null safely
  const commentCount = article.commentCount ?? 0;

  return (
    <Link href={`/article/${article.slug}`}>
      <div className="featured-article group cursor-pointer">
        <div className="relative h-[500px] w-full overflow-hidden rounded-lg">
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent z-10" />
          
          {/* Background Image */}
          {article.coverImageUrl ? (
            <Image
              src={article.coverImageUrl}
              alt={article.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              priority
            />
          ) : (
            <div className="absolute inset-0 bg-muted" />
          )}

          {/* Content */}
          <div className="featured-article-content">
            {article.categoryName && (
              <span className="article-card-category">
                {article.categoryName.toUpperCase()}
              </span>
            )}
            
            <h1 className="text-4xl md:text-5xl font-bold mb-3 text-balance text-white">
              {article.title}
            </h1>
            
            {article.excerpt && (
              <p className="text-lg text-white/90 mb-4 line-clamp-2">
                {article.excerpt}
              </p>
            )}
            
            <div className="flex items-center gap-4 text-sm text-white/80">
              {article.authorName && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{article.authorName}</span>
                </div>
              )}
              
              {article.readingTimeMinutes && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{article.readingTimeMinutes} min read</span>
                </div>
              )}
              
              {commentCount > 0 && (
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  <span>{commentCount} comments</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}