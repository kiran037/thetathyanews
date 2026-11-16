///components/main/bookmarks/bookmark-button.tsx
"use client";

import { useState, useEffect } from "react";
import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface BookmarkButtonProps {
  articleId: string;
  variant?: "default" | "ghost" | "outline";
  size?: "default" | "sm" | "lg";
  showLabel?: boolean;
}

export function BookmarkButton({
  articleId,
  variant = "ghost",
  size = "sm",
  showLabel = false,
}: BookmarkButtonProps) {
  const router = useRouter();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    checkBookmarkStatus();
  }, [articleId]);

  const checkBookmarkStatus = async () => {
    try {
      const response = await fetch("/api/me");
      if (!response.ok) {
        setChecking(false);
        return;
      }

      // Check if article is bookmarked
      const bookmarksResponse = await fetch("/api/bookmarks");
      if (bookmarksResponse.ok) {
        const data = await bookmarksResponse.json();
        const bookmarked = data.bookmarks.some(
          (b: any) => b.articleId === articleId
        );
        setIsBookmarked(bookmarked);
      }
    } catch (error) {
      // User not logged in or error
    } finally {
      setChecking(false);
    }
  };

  const handleToggle = async () => {
    // Check if user is logged in
    try {
      const response = await fetch("/api/me");
      if (!response.ok) {
        toast.error("Please log in to bookmark articles");
        router.push("/login");
        return;
      }
    } catch (error) {
      toast.error("Please log in to bookmark articles");
      router.push("/login");
      return;
    }

    setLoading(true);

    try {
      if (isBookmarked) {
        // Find and remove bookmark
        const bookmarksResponse = await fetch("/api/bookmarks");
        const data = await bookmarksResponse.json();
        const bookmark = data.bookmarks.find(
          (b: any) => b.articleId === articleId
        );

        if (bookmark) {
          const response = await fetch(`/api/bookmarks?id=${bookmark.id}`, {
            method: "DELETE",
          });

          const result = await response.json();

          if (!response.ok) {
            throw new Error(result.error);
          }

          setIsBookmarked(false);
          toast.success("Bookmark removed");
        }
      } else {
        // Add bookmark
        const response = await fetch("/api/bookmarks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ articleId }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error);
        }

        setIsBookmarked(true);
        toast.success("Article bookmarked");
      }

      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to update bookmark");
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return null;
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleToggle}
      disabled={loading}
      className={isBookmarked ? "text-primary" : ""}
    >
      <Bookmark
        className={`h-4 w-4 ${isBookmarked ? "fill-current" : ""}`}
      />
      {showLabel && (
        <span className="ml-2">
          {isBookmarked ? "Bookmarked" : "Bookmark"}
        </span>
      )}
    </Button>
  );
}