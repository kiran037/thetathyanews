///components/main/bookmarks/collection-card.tsx
"use client";

import Link from "next/link";
import { Folder, Lock, Globe, MoreVertical, Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface CollectionCardProps {
  collection: {
    id: string;
    name: string;
    description: string | null;
    bookmarkCount: number;
    isPublic: boolean;
    updatedAt: Date;
  };
  onDelete?: () => void;
}

export function CollectionCard({ collection, onDelete }: CollectionCardProps) {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Delete collection "${collection.name}"? Bookmarks will be moved to uncategorized.`)) {
      return;
    }

    setDeleting(true);

    try {
      const response = await fetch(`/api/bookmarks/collections?id=${collection.id}`, {
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
      toast.error(error.message || "Failed to delete collection");
    } finally {
      setDeleting(false);
      setShowMenu(false);
    }
  };

  return (
    <div className="rounded-lg border border-border bg-card p-4 hover:shadow-md transition-shadow relative">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Folder className="h-5 w-5 text-primary" />
          </div>
          <div>
            <Link href={`/bookmarks/collections/${collection.id}`}>
              <h3 className="font-semibold hover:text-primary transition-colors">
                {collection.name}
              </h3>
            </Link>
            <p className="text-xs text-muted-foreground">
              {collection.bookmarkCount} {collection.bookmarkCount === 1 ? "bookmark" : "bookmarks"}
            </p>
          </div>
        </div>

        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowMenu(!showMenu)}
            className="h-8 w-8 p-0"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>

          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 mt-1 w-40 rounded-md border border-border bg-card shadow-lg z-20">
                <Link
                  href={`/bookmarks/collections/${collection.id}/edit`}
                  className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors"
                  onClick={() => setShowMenu(false)}
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </Link>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  {deleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {collection.description && (
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {collection.description}
        </p>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          {collection.isPublic ? (
            <>
              <Globe className="h-3 w-3" />
              <span>Public</span>
            </>
          ) : (
            <>
              <Lock className="h-3 w-3" />
              <span>Private</span>
            </>
          )}
        </div>

        <span className="text-xs text-muted-foreground">
          Updated {new Date(collection.updatedAt).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
}
