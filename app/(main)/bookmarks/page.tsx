///app/(main)/bookmarks/page.tsx
import { requireAuth } from "@/lib/auth-server";
import { db } from "@/db";
import { bookmarks, articles, categories, authors } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";
import { Bookmark, Plus, FolderOpen } from "lucide-react";
import { BookmarkCard } from "@/components/main/bookmarks/bookmark-card";

export const metadata = {
  title: "Bookmarks - TheTathyaNews",
  description: "Your saved articles",
};

export default async function BookmarksPage() {
  const user = await requireAuth();

  const userBookmarks = await db
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
    .where(eq(bookmarks.userId, user.id))
    .orderBy(desc(bookmarks.createdAt));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Bookmark className="h-8 w-8 text-primary" />
            My Bookmarks
          </h1>
          <p className="text-muted-foreground mt-2">
            Articles you've saved for later
          </p>
        </div>

        <Link
          href="/bookmarks/collections"
          className="btn-primary px-4 py-2 flex items-center gap-2"
        >
          <FolderOpen className="h-4 w-4" />
          Collections
        </Link>
      </div>

      {/* Stats */}
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-center gap-6">
          <div>
            <p className="text-sm text-muted-foreground">Total Bookmarks</p>
            <p className="text-2xl font-bold">{userBookmarks.length}</p>
          </div>
          <div className="h-10 w-px bg-border" />
          <div>
            <p className="text-sm text-muted-foreground">This Month</p>
            <p className="text-2xl font-bold">
              {userBookmarks.filter(b => 
                new Date(b.createdAt).getMonth() === new Date().getMonth()
              ).length}
            </p>
          </div>
        </div>
      </div>

      {/* Bookmarks Grid */}
      {userBookmarks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userBookmarks.map((bookmark) => (
            <BookmarkCard key={bookmark.id} bookmark={bookmark} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Bookmark className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No bookmarks yet</h3>
          <p className="text-muted-foreground mb-4">
            Start bookmarking articles to save them for later
          </p>
          <Link href="/" className="btn-primary px-6 py-2">
            Browse Articles
          </Link>
        </div>
      )}
    </div>
  );
}
