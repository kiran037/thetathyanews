// File: components/main/article/comment-form.tsx
// Form component for posting new comments

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import { toast } from "sonner";

interface CommentFormProps {
  articleSlug: string;
  parentId?: string;
  user: {
    id: string;
    displayName: string | null;
    avatarUrl: string | null;
  } | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CommentForm({ articleSlug, parentId, user, onSuccess, onCancel }: CommentFormProps) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("Please login to comment");
      router.push(`/login?callbackUrl=/article/${articleSlug}`);
      return;
    }

    if (!content.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/main/articles/${articleSlug}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: content.trim(),
          parentId,
          userId: user.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to post comment");
      }

      toast.success(data.message || "Comment submitted!");
      setContent("");
      onSuccess?.();
      router.refresh();
    } catch (error: unknown) {
      const err = error as Error;
      toast.error(err.message || "Failed to post comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="bg-card border border-border rounded-lg p-6 text-center">
        <p className="text-muted-foreground mb-4">
          Please sign in to leave a comment
        </p>
        <Button onClick={() => router.push(`/login?callbackUrl=/article/${articleSlug}`)}>
          Sign In
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.displayName || "User"}
              className="w-10 h-10 rounded-full"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-5 w-5 text-primary" />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={parentId ? "Write a reply..." : "Write a comment..."}
            className="newsletter-input min-h-[100px] w-full resize-y"
            disabled={isSubmitting}
            maxLength={2000}
          />
          <p className="text-xs text-muted-foreground mt-1">
            {content.length}/2000 characters
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2">
        {parentId && onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
        )}
        <Button type="submit" loading={isSubmitting} disabled={!content.trim()}>
          {parentId ? "Reply" : "Post Comment"}
        </Button>
      </div>
    </form>
  );
}