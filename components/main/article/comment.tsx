// File: components/main/article/comment.tsx
// Component for displaying a single comment with replies

"use client";

import { useState } from "react";
import { User, ThumbsUp, Reply, MoreVertical } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface CommentProps {
  comment: {
    id: string;
    content: string;
    createdAt: Date;
    updatedAt: Date | null;
    likeCount: number | null;
    parentId: string | null;
    user: {
      id: string;
      displayName: string | null;
      firstName: string | null;
      lastName: string | null;
      avatarUrl: string | null;
    } | null;
    replyCount: number;
  };
  onReply?: (commentId: string) => void;
  onLike?: (commentId: string) => void;
  depth?: number;
}

export function Comment({ comment, onReply, onLike, depth = 0 }: CommentProps) {
  const [showReplies, setShowReplies] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const handleLike = () => {
    setIsLiked(!isLiked);
    onLike?.(comment.id);
  };

  const displayName = comment.user?.displayName || 
    `${comment.user?.firstName || ""} ${comment.user?.lastName || ""}`.trim() || 
    "Anonymous";

  const timeAgo = formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true });

  return (
    <div className={`${depth > 0 ? "ml-8 md:ml-12" : ""}`}>
      <div className="flex gap-3 md:gap-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {comment.user?.avatarUrl ? (
            <img
              src={comment.user.avatarUrl}
              alt={displayName}
              className="w-8 h-8 md:w-10 md:h-10 rounded-full"
            />
          ) : (
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-4 w-4 md:h-5 md:w-5 text-primary" />
            </div>
          )}
        </div>

        {/* Comment Content */}
        <div className="flex-1 min-w-0">
          <div className="bg-card border border-border rounded-lg p-3 md:p-4">
            {/* Header */}
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <h4 className="font-semibold text-sm">{displayName}</h4>
                <time className="text-xs text-muted-foreground">{timeAgo}</time>
              </div>
              <button className="text-muted-foreground hover:text-foreground transition-colors">
                <MoreVertical className="h-4 w-4" />
              </button>
            </div>

            {/* Content */}
            <p className="text-sm whitespace-pre-wrap break-words">{comment.content}</p>

            {/* Actions */}
            <div className="flex items-center gap-4 mt-3 text-xs">
              <button
                onClick={handleLike}
                className={`flex items-center gap-1 transition-colors ${
                  isLiked ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <ThumbsUp className={`h-3.5 w-3.5 ${isLiked ? "fill-primary" : ""}`} />
                <span>{(comment.likeCount || 0) + (isLiked ? 1 : 0)}</span>
              </button>

              {depth < 3 && onReply && (
                <button
                  onClick={() => onReply(comment.id)}
                  className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Reply className="h-3.5 w-3.5" />
                  <span>Reply</span>
                </button>
              )}

              {comment.replyCount > 0 && (
                <button
                  onClick={() => setShowReplies(!showReplies)}
                  className="flex items-center gap-1 text-primary hover:text-primary/80 transition-colors"
                >
                  <span>
                    {showReplies ? "Hide" : "Show"} {comment.replyCount}{" "}
                    {comment.replyCount === 1 ? "reply" : "replies"}
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* Show replies section placeholder */}
          {showReplies && comment.replyCount > 0 && (
            <div className="mt-4 space-y-4">
              <p className="text-sm text-muted-foreground">
                Replies loading... (implement nested comment fetching)
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}