// File: app/(main)/article/[slug]/comments/page.tsx
// Full comments page - shows all comments for an article with pagination

import { Suspense } from "react";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Loader2, MessageCircle, ArrowLeft } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { CommentsList } from "@/components/main/article/comments-list";
import { CommentForm } from "@/components/main/article/comment-form";
import { Pagination } from "@/components/ui/pagination";

import { getArticleBySlug } from "@/lib/data/articles";
import { getArticleComments } from "@/lib/data/comments";

interface CommentsPageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    page?: string;
  }>;
}

export async function generateMetadata(props: CommentsPageProps) {
  const params = await props.params;
  const article = await getArticleBySlug(params.slug);

  if (!article) {
    return {
      title: "Comments - TheTathyaNews",
    };
  }

  return {
    title: `Comments on "${article.title}" - TheTathyaNews`,
    description: `Read and join the discussion about ${article.title}`,
  };
}

export default async function CommentsPage(props: CommentsPageProps) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const page = parseInt(searchParams.page || "1");
  const article = await getArticleBySlug(params.slug);

  if (!article) {
    notFound();
  }

  const commentsData = (await getArticleComments(params.slug, { page, limit: 20 })) || {
    comments: [],
    pagination: { page, limit: 20, total: 0, totalPages: 0 },
  };

  // Get current user
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session_token")?.value;
  const currentUser = await getCurrentUser(); // This function already handles cookies internally
  
  let user = null;
  if (currentUser) {
    user = {
      id: currentUser.id,
      displayName: currentUser.displayName,
      avatarUrl: currentUser.avatarUrl,
    };
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Back to Article */}
      <div>
        <Link
          href={`/article/${params.slug}`}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to article
        </Link>
      </div>

      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-3">
          <MessageCircle className="h-7 w-7 text-primary" />
          <h1 className="text-3xl font-bold">
            Comments ({commentsData.pagination.total})
          </h1>
        </div>
        <p className="text-lg text-muted-foreground line-clamp-2">
          Discussion about: <span className="font-medium text-foreground">{article.title}</span>
        </p>
      </div>

      {/* Comment Form */}
      <div className="bg-muted/30 border border-border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Join the Discussion</h2>
        <CommentForm articleSlug={params.slug} user={user} />
      </div>

      {/* Comments List */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">
          All Comments ({commentsData.pagination.total})
        </h2>

        <Suspense
          fallback={
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          }
        >
          {commentsData.comments.length === 0 ? (
            <div className="text-center py-12 bg-card border border-border rounded-lg">
              <MessageCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Comments Yet</h3>
              <p className="text-muted-foreground mb-6">
                Be the first to share your thoughts!
              </p>
              {!user && (
                <Link href={`/login?callbackUrl=/article/${params.slug}/comments`} className="btn-primary">
                  Sign In to Comment
                </Link>
              )}
            </div>
          ) : (
            <>
              <CommentsList comments={commentsData.comments} />

              {/* Pagination */}
              {commentsData.pagination.totalPages > 1 && (
                <div className="mt-8">
                  <Pagination
                    currentPage={commentsData.pagination.page}
                    totalPages={commentsData.pagination.totalPages}
                    baseUrl={`/article/${params.slug}/comments`}
                  />
                </div>
              )}
            </>
          )}
        </Suspense>
      </div>

      {/* Guidelines */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="font-semibold mb-3">Community Guidelines</h3>
        <ul className="text-sm text-muted-foreground space-y-2">
          <li>• Be respectful and constructive in your comments</li>
          <li>• No hate speech, harassment, or personal attacks</li>
          <li>• Stay on topic and relevant to the article</li>
          <li>• Comments are moderated and may take time to appear</li>
          <li>• Report inappropriate comments using the menu</li>
        </ul>
      </div>
    </div>
  );
}