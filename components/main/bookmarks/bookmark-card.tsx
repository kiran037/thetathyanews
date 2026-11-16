///components/main/bookmarks/bookmark-card.tsx
"use client";

import Link from "next/link";
import { Clock, Trash2, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface BookmarkCardProps {
  bookmark: {
    id: string;
    note: string | null;
    createdAt: Date;
    articleSlug: string;
    articleTitle: string;
    articleExcerpt: string | null;
    articleCoverImage: string | null;
    articleReadingTime: number | null;
    categoryName: string | null;
    authorName: string | null;
  };
  onDelete?: () => void;
}

export function BookmarkCard({ bookmark, onDelete }: BookmarkCardProps) {
  const router = useRouter();

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/bookmarks?id=${bookmark.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      toast.success(data.message);
      if (onDelete) onDelete();
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to remove bookmark");
    }
  };

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden hover:shadow-md transition-shadow">
      <Link href={`/article/${bookmark.articleSlug}`}>
        <div className="relative h-48 w-full bg-muted">
          {bookmark.articleCoverImage ? (
            <Image
              src={bookmark.articleCoverImage}
              alt={bookmark.articleTitle}
              fill
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5" />
          )}
        </div>
      </Link>

      <div className="p-4">
        {bookmark.categoryName && (
          <span className="inline-block px-2 py-0.5 text-xs font-semibold text-primary bg-primary/10 rounded mb-2">
            {bookmark.categoryName.toUpperCase()}
          </span>
        )}

        <Link href={`/article/${bookmark.articleSlug}`}>
          <h3 className="font-semibold mb-2 hover:text-primary transition-colors line-clamp-2">
            {bookmark.articleTitle}
          </h3>
        </Link>

        {bookmark.articleExcerpt && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {bookmark.articleExcerpt}
          </p>
        )}

        {bookmark.note && (
          <div className="mb-3 p-2 rounded bg-muted">
            <p className="text-xs text-muted-foreground italic">
              Note: {bookmark.note}
            </p>
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            {bookmark.authorName && <span>{bookmark.authorName}</span>}
            {bookmark.articleReadingTime && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{bookmark.articleReadingTime} min</span>
              </div>
            )}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            className="h-7 px-2 text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        <p className="text-xs text-muted-foreground mt-2">
          Saved {new Date(bookmark.createdAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}