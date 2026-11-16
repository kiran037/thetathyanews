// File: components/main/library/library-article-card.tsx
// Article card for library pages with reading progress

import Link from "next/link";
import { Clock, User, Trash2, CheckCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface LibraryArticleCardProps {
  data: {
    id: string;
    readPercentage?: number | null;
    timeSpentSeconds?: number | null;
    lastReadAt?: Date | null;
    isCompleted?: boolean | null;
    reactionType?: string | null;
    createdAt?: Date | null;
    article: {
      id: string;
      slug: string;
      title: string;
      excerpt: string | null;
      coverImageUrl: string | null;
      publishedAt: Date | null;
      readingTimeMinutes: number | null;
      viewCount: number | null;
      commentCount: number | null;
    };
    category: {
      name: string;
      slug: string;
    } | null;
    author: {
      displayName: string;
      slug: string;
      avatarUrl: string | null;
    } | null;
  };
  showProgress?: boolean;
  showTimeSpent?: boolean;
  showReaction?: boolean;
  onDelete?: () => void;
}

export function LibraryArticleCard({
  data,
  showProgress = true,
  showTimeSpent = false,
  showReaction = false,
  onDelete,
}: LibraryArticleCardProps) {
  const timeAgo = data.lastReadAt || data.createdAt
    ? formatDistanceToNow(new Date(data.lastReadAt || data.createdAt!), { addSuffix: true })
    : null;

  const formatTimeSpent = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  };

  const getReactionEmoji = (type: string) => {
    const emojis: Record<string, string> = {
      like: "👍",
      love: "❤️",
      laugh: "😂",
      insightful: "💡",
      thinking: "🤔",
      angry: "😠",
    };
    return emojis[type] || "👍";
  };

  const readPercentage = data.readPercentage ?? 0;
  const timeSpentSeconds = data.timeSpentSeconds ?? 0;

  return (
    <div className="group relative">
      <Link href={`/article/${data.article.slug}`}>
        <article className="article-card">
          {/* Progress Bar */}
          {showProgress && readPercentage > 0 && (
            <div className="absolute top-0 left-0 right-0 h-1 bg-muted rounded-t-lg overflow-hidden">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${readPercentage}%` }}
              />
            </div>
          )}

          {data.article.coverImageUrl && (
            <div className="relative aspect-video w-full bg-muted">
              <img
                src={data.article.coverImageUrl}
                alt={data.article.title}
                className="article-card-image"
              />
              {/* Completed Badge */}
              {data.isCompleted && (
                <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-md text-xs font-semibold flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Completed
                </div>
              )}
              {/* Reaction Badge */}
              {showReaction && data.reactionType && (
                <div className="absolute top-2 left-2 bg-background/90 backdrop-blur-sm px-2 py-1 rounded-md text-lg">
                  {getReactionEmoji(data.reactionType)}
                </div>
              )}
            </div>
          )}

          <div className="article-card-content">
            {data.category && (
              <span className="article-card-category">{data.category.name}</span>
            )}
            <h3 className="article-card-title">{data.article.title}</h3>
            {data.article.excerpt && (
              <p className="article-card-excerpt">{data.article.excerpt}</p>
            )}

            <div className="article-card-meta">
              {data.author && (
                <div className="flex items-center gap-2">
                  <User className="h-3 w-3" />
                  <span>{data.author.displayName}</span>
                </div>
              )}
              {data.article.readingTimeMinutes && (
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3" />
                  <span>{data.article.readingTimeMinutes} min</span>
                </div>
              )}
            </div>

            {/* Additional Stats */}
            <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-muted-foreground">
              {timeAgo && <span>Last viewed {timeAgo}</span>}
              {showTimeSpent && timeSpentSeconds > 0 && (
                <span>Time spent: {formatTimeSpent(timeSpentSeconds)}</span>
              )}
              {showProgress && readPercentage > 0 && (
                <span>{readPercentage}% read</span>
              )}
            </div>
          </div>
        </article>
      </Link>

      {/* Delete Button */}
      {onDelete && (
        <button
          onClick={(e) => {
            e.preventDefault();
            onDelete();
          }}
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-destructive text-destructive-foreground p-2 rounded-full hover:bg-destructive/90"
          aria-label="Remove from library"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}