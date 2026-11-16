// File: app/(main)/bookmarks/collections/page.tsx
import { requireAuth } from "@/lib/auth-server";
import { db } from "@/db";
import { bookmarkCollections } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";
import { FolderPlus, ArrowLeft } from "lucide-react";
import { CollectionCard } from "@/components/main/bookmarks/collection-card";

export const metadata = {
  title: "Bookmark Collections - TheTathyaNews",
  description: "Organize your bookmarks",
};

export default async function CollectionsPage() {
  const user = await requireAuth();

  const collectionsData = await db
    .select()
    .from(bookmarkCollections)
    .where(eq(bookmarkCollections.userId, user.id))
    .orderBy(desc(bookmarkCollections.updatedAt));

  // Transform data to match component expectations
  // Handle nullable fields (bookmarkCount, isPublic) by providing defaults
  const collections = collectionsData.map(c => ({
    ...c,
    bookmarkCount: c.bookmarkCount ?? 0,
    isPublic: c.isPublic ?? false
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link
              href="/bookmarks"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-3xl font-bold">Bookmark Collections</h1>
          </div>
          <p className="text-muted-foreground">
            Organize your bookmarks into collections
          </p>
        </div>

        <Link
          href="/bookmarks/collections/new"
          className="btn-primary px-4 py-2 flex items-center gap-2"
        >
          <FolderPlus className="h-4 w-4" />
          New Collection
        </Link>
      </div>

      {/* Collections Grid */}
      {collections.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map((collection) => (
            <CollectionCard key={collection.id} collection={collection} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <FolderPlus className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No collections yet</h3>
          <p className="text-muted-foreground mb-4">
            Create collections to organize your bookmarks
          </p>
          <Link
            href="/bookmarks/collections/new"
            className="btn-primary px-6 py-2"
          >
            Create Your First Collection
          </Link>
        </div>
      )}
    </div>
  );
}