
///app/(main)/bookmarks/collections/[id]/page.tsx
import { requireAuth } from "@/lib/auth-server";
import { db } from "@/db";
import { bookmarkCollections, bookmarks, articles, categories, authors } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import Link from "next/link";
import { ArrowLeft, Edit, Trash2, Globe, Lock } from "lucide-react";
import { BookmarkCard } from "@/components/main/bookmarks/bookmark-card";
import { notFound } from "next/navigation";

interface CollectionPageProps {
  params: Promise<{ id: string }>;
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const user = await requireAuth();
  const { id } = await params;

  // Get collection
  const [collection] = await db
    .select()
    .from(bookmarkCollections)
    .where(eq(bookmarkCollections.id, id))
    .limit(1);

  if (!collection || collection.userId !== user.id) {
    notFound();
  }

  // Get bookmarks in this collection
  const collectionBookmarks = await db
    .select({
      id: bookmarks.id,
      note: bookmarks.note,
      createdAt: bookmarks.createdAt,
      collectionId: bookmarks.collectionId,
      articleId: articles.id,
      articleSlug: articles.slug,
      articleTitle: articles.title,
      articleExcerpt: articles.excerpt,
      articleCoverImage: articles.coverImageUrl,
      articleReadingTime: articles.readingTimeMinutes,
      categoryName: categories.name,
      categorySlug: categories.slug,
      authorName: authors.displayName,
    })
    .from(bookmarks)
    .innerJoin(articles, eq(bookmarks.articleId, articles.id))
    .leftJoin(categories, eq(articles.categoryId, categories.id))
    .leftJoin(authors, eq(articles.primaryAuthorId, authors.id))
    .where(
      and(
        eq(bookmarks.userId, user.id),
        eq(bookmarks.collectionId, id)
      )
    )
    .orderBy(desc(bookmarks.createdAt));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <Link
            href="/bookmarks/collections"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-3xl font-bold">{collection.name}</h1>
        </div>
        
        {collection.description && (
          <p className="text-muted-foreground">{collection.description}</p>
        )}

        <div className="flex items-center gap-4 mt-3">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            {collection.isPublic ? (
              <>
                <Globe className="h-4 w-4" />
                <span>Public</span>
              </>
            ) : (
              <>
                <Lock className="h-4 w-4" />
                <span>Private</span>
              </>
            )}
          </div>

          <span className="text-sm text-muted-foreground">
            {collectionBookmarks.length} {collectionBookmarks.length === 1 ? "bookmark" : "bookmarks"}
          </span>

          <div className="flex gap-2 ml-auto">
            <Link
              href={`/bookmarks/collections/${id}/edit`}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-border hover:bg-accent transition-colors text-sm"
            >
              <Edit className="h-4 w-4" />
              Edit
            </Link>
          </div>
        </div>
      </div>

      {/* Bookmarks */}
      {collectionBookmarks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collectionBookmarks.map((bookmark) => (
            <BookmarkCard key={bookmark.id} bookmark={bookmark} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 rounded-lg border border-border bg-card">
          <p className="text-muted-foreground">
            No bookmarks in this collection yet
          </p>
          <Link href="/bookmarks" className="link text-sm mt-2 inline-block">
            Browse your bookmarks
          </Link>
        </div>
      )}
    </div>
  );
}
