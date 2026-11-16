// File: app/(main)/article/[slug]/page.tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import { Calendar, Clock, User, Eye, Share2, Bookmark, MessageCircle, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { Comment } from "@/components/main/article/comment";
import { CommentForm } from "@/components/main/article/comment-form";
import { getCurrentUser } from "@/lib/auth"; 

import { getArticleBySlug } from "@/lib/data/articles";
import { getArticleComments } from "@/lib/data/comments";
import { ReadingProgress } from "@/components/main/article/reading-progress";

interface ArticlePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata(props: ArticlePageProps) {
  const params = await props.params;
  const article = await getArticleBySlug(params.slug);

  if (!article) {
    return {
      title: "Article Not Found",
    };
  }

  return {
    title: `${article.title} - TheTathyaNews`,
    description: article.excerpt || article.title,
    openGraph: {
      title: article.ogTitle || article.title,
      description: article.ogDescription || article.excerpt,
      images: article.ogImageUrl ? [article.ogImageUrl] : [],
    },
  };
}

export default async function ArticlePage(props: ArticlePageProps) {
  const params = await props.params;
  const article = await getArticleBySlug(params.slug, { incrementView: true });

  if (!article) {
    notFound();
  }

  // Fetch comments
  const commentsData = (await getArticleComments(params.slug, { limit: 5 })) || { comments: [], pagination: { total: 0 } };

  // Get current user using existing auth lib
  const currentUser = await getCurrentUser();
  
  // Format user object for the CommentForm
  const user = currentUser ? {
    id: currentUser.id,
    displayName: currentUser.displayName,
    avatarUrl: currentUser.avatarUrl,
  } : null;

  return (
    <div className="max-w-4xl mx-auto py-8">
      <ReadingProgress
        articleId={article.id}
        slug={article.slug}
        isAuthenticated={!!currentUser}
      />
      {/* Main Content */}
      <article>
        {/* Article Header */}
        <header className="mb-8">
          {article.category && (
            <Link
              href={`/categories/${article.category.slug}`}
              className="inline-block mb-4"
            >
              <span className="article-card-category">{article.category.name}</span>
            </Link>
          )}

          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-balance">
            {article.title}
          </h1>

          {article.subtitle && (
            <p className="text-xl text-muted-foreground mb-6">{article.subtitle}</p>
          )}

          {/* Article Meta */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground border-t border-b border-border py-4">
            {article.primaryAuthor && (
              <Link
                href={`/author/${article.primaryAuthor.slug}`}
                className="flex items-center gap-2 hover:text-primary transition-colors"
              >
                {article.primaryAuthor.avatarUrl ? (
                  <img
                    src={article.primaryAuthor.avatarUrl}
                    alt={article.primaryAuthor.displayName}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                )}
                <span className="font-medium">{article.primaryAuthor.displayName}</span>
              </Link>
            )}

            {article.publishedAt && (
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {format(new Date(article.publishedAt), "MMM d, yyyy")}
              </span>
            )}

            {article.readingTimeMinutes && (
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {article.readingTimeMinutes} min read
              </span>
            )}

            {article.viewCount !== null && (
              <span className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {article.viewCount.toLocaleString()} views
              </span>
            )}

            {article.commentCount !== null && article.commentCount > 0 && (
              <Link
                href={`/article/${params.slug}/comments`}
                className="flex items-center gap-1 hover:text-primary transition-colors"
              >
                <MessageCircle className="h-4 w-4" />
                {article.commentCount} comments
              </Link>
            )}
          </div>

          {/* Social Actions */}
          <div className="flex gap-2 mt-4">
            <button className="btn-ghost px-3 py-2 flex items-center gap-2 text-sm">
              <Share2 className="h-4 w-4" />
              Share
            </button>
            <button className="btn-ghost px-3 py-2 flex items-center gap-2 text-sm">
              <Bookmark className="h-4 w-4" />
              Save
            </button>
          </div>
        </header>

        {/* Featured Image */}
        {article.coverImageUrl && (
          <figure className="mb-8 rounded-lg overflow-hidden">
            <img
              src={article.coverImageUrl}
              alt={article.coverImageAlt || article.title}
              className="w-full"
            />
            {article.coverImageCredit && (
              <figcaption className="text-xs text-muted-foreground mt-2 px-2">
                {article.coverImageCredit}
              </figcaption>
            )}
          </figure>
        )}

        {/* Article Content */}
        <div
          className="prose prose-lg max-w-none dark:prose-invert prose-headings:text-foreground prose-p:text-foreground prose-a:text-primary prose-strong:text-foreground prose-code:text-foreground prose-img:rounded-lg mb-8"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="mt-8 pt-8 border-t border-border">
            <h3 className="text-sm font-semibold mb-3">Tags:</h3>
            <div className="flex flex-wrap gap-2">
              {article.tags.map((articleTag: any) => {
                const tag = articleTag.tag || articleTag;
                if (!tag || !tag.slug) return null;
                return (
                  <Link
                    key={tag.id || tag.slug}
                    href={`/tags/${tag.slug}`}
                    className="category-tag"
                  >
                    {tag.name}
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Author Bio */}
        {article.primaryAuthor && (
          <div className="mt-8 p-6 bg-card border border-border rounded-lg">
            <div className="flex items-start gap-4">
              {article.primaryAuthor.avatarUrl ? (
                <img
                  src={article.primaryAuthor.avatarUrl}
                  alt={article.primaryAuthor.displayName}
                  className="w-16 h-16 rounded-full flex-shrink-0"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <User className="h-8 w-8 text-primary" />
                </div>
              )}
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-1">
                  {article.primaryAuthor.displayName}
                </h3>
                {article.primaryAuthor.bio && (
                  <p className="text-sm text-muted-foreground mb-2">{article.primaryAuthor.bio}</p>
                )}
                <Link
                  href={`/author/${article.primaryAuthor.slug}`}
                  className="text-sm text-primary hover:underline"
                >
                  View all articles →
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Comments Section */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <MessageCircle className="h-6 w-6 text-primary" />
              Comments ({commentsData.pagination.total})
            </h2>
            {commentsData.pagination.total > 5 && (
              <Link
                href={`/article/${params.slug}/comments`}
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                View all comments
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>

          {/* Comment Form */}
          <div className="mb-8">
            <CommentForm articleSlug={params.slug} user={user} />
          </div>

          {/* Comments Preview */}
          {commentsData.comments.length > 0 && (
            <div className="space-y-6">
              {commentsData.comments.map((comment: any) => (
                <Comment key={comment.id} comment={comment} />
              ))}
              {commentsData.pagination.total > 5 && (
                <div className="text-center pt-4">
                  <Link href={`/article/${params.slug}/comments`} className="btn-secondary">
                    View All {commentsData.pagination.total} Comments
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </article>
    </div>
  );
}