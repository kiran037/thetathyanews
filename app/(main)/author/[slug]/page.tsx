// File: app/(main)/author/[slug]/page.tsx
// Single author profile page with bio, stats, and recent articles

import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Loader2, User, BookOpen, Eye, MessageCircle, Share2, ArrowLeft, Globe, Twitter, Linkedin, CheckCircle, Award } from "lucide-react";
import Link from "next/link";
import { ArticleCard } from "@/components/main/article/article-card";
import { AuthorCard } from "@/components/main/authors/author-card";
import { getAuthorWithArticles, getAuthors } from "@/lib/data/authors";

// Interface for Next.js 15+ (params is a Promise)
interface AuthorPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata(props: AuthorPageProps) {
  const params = await props.params;
  const data = await getAuthorWithArticles(params.slug, { page: 1, limit: 1 });

  if (!data) {
    return {
      title: "Author Not Found",
    };
  }

  return {
    title: `${data.author.displayName} - TheTathyaNews`,
    description: data.author.bio || `Read articles by ${data.author.displayName} on TheTathyaNews`,
  };
}

export default async function AuthorPage(props: AuthorPageProps) {
  const params = await props.params;
  const data = await getAuthorWithArticles(params.slug, { page: 1, limit: 6 });

  if (!data) {
    notFound();
  }

  const allAuthors = await getAuthors({ sortBy: "articles", limit: 4 });
  const otherAuthors = allAuthors.authors.filter((a) => a.id !== data.author.id).slice(0, 3);

  // Defensively cast all stats to Number() to avoid display glitches
  const articleCount = Number(data.author.articleCount || 0);
  const totalViews = Number(data.author.totalViews || 0);
  const totalComments = Number(data.author.totalComments || 0);
  const totalShares = Number(data.author.totalShares || 0);

  return (
    <div className="max-w-7xl mx-auto">
      {/* Back Navigation */}
      <div className="mb-6">
        <Link
          href="/author"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          All Authors
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Author Profile Header */}
          <div className="bg-card border border-border rounded-lg p-8 mb-8">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Avatar */}
              {data.author.avatarUrl ? (
                <img
                  src={data.author.avatarUrl}
                  alt={data.author.displayName}
                  className="w-32 h-32 rounded-full object-cover flex-shrink-0 mx-auto md:mx-0"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mx-auto md:mx-0">
                  <User className="h-16 w-16 text-primary" />
                </div>
              )}

              {/* Info */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                  <h1 className="text-3xl font-bold">{data.author.displayName}</h1>
                  {data.author.isVerified && (
                    <CheckCircle className="h-6 w-6 text-primary fill-primary flex-shrink-0" />
                  )}
                  {data.author.isStaff && (
                    <Award className="h-6 w-6 text-yellow-500 flex-shrink-0" />
                  )}
                </div>

                {data.author.title && (
                  <p className="text-lg text-muted-foreground mb-4">{data.author.title}</p>
                )}

                {data.author.bio && (
                  <p className="text-foreground mb-4">{data.author.bio}</p>
                )}

                {/* Social Links */}
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-4">
                  {data.author.website && (
                    <a
                      href={data.author.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Globe className="h-4 w-4" />
                      Website
                    </a>
                  )}
                  {data.author.twitter && (
                    <a
                      href={`https://twitter.com/${data.author.twitter}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Twitter className="h-4 w-4" />
                      @{data.author.twitter}
                    </a>
                  )}
                  {data.author.linkedin && (
                    <a
                      href={data.author.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Linkedin className="h-4 w-4" />
                      LinkedIn
                    </a>
                  )}
                </div>

                {/* Stats */}
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold">{articleCount}</span>
                    <span className="text-muted-foreground">Articles</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold">{totalViews.toLocaleString()}</span>
                    <span className="text-muted-foreground">Views</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold">{totalComments.toLocaleString()}</span>
                    <span className="text-muted-foreground">Comments</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Share2 className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold">{totalShares.toLocaleString()}</span>
                    <span className="text-muted-foreground">Shares</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Articles Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Recent Articles</h2>
              {data.pagination.total > 6 && (
                <Link
                  href={`/author/${params.slug}/articles`}
                  className="text-sm text-primary hover:underline"
                >
                  View all {data.pagination.total} articles →
                </Link>
              )}
            </div>

            <Suspense
              fallback={
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              }
            >
              {data.articles.length === 0 ? (
                <div className="text-center py-12 bg-card border border-border rounded-lg">
                  <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Articles Yet</h3>
                  <p className="text-muted-foreground">
                    {data.author.displayName} hasn&apos;t published any articles yet
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {data.articles.map((article: any) => (
                    <ArticleCard key={article.id} article={article} />
                  ))}
                </div>
              )}
            </Suspense>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-1">
          <div className="sticky top-20 space-y-8">
            {/* Other Authors */}
            {otherAuthors.length > 0 && (
              <div>
                <h3 className="text-lg font-bold mb-4">Other Authors</h3>
                <div className="space-y-3">
                  {otherAuthors.map((author: any) => (
                    <AuthorCard
                      key={author.id}
                      author={author}
                      variant="compact"
                      showStats={true}
                    />
                  ))}
                </div>
                <div className="mt-4">
                  <Link
                    href="/author"
                    className="text-sm text-primary hover:underline"
                  >
                    View all authors →
                  </Link>
                </div>
              </div>
            )}

            {/* Subscribe CTA */}
            <div className="rounded-lg border border-border bg-gradient-to-br from-primary/5 to-primary/10 p-6 text-center">
              <h4 className="font-bold text-lg mb-2">Follow {data.author.displayName}</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Get notified when they publish new articles
              </p>
              <Link href="/pricing" className="btn-primary w-full">
                Subscribe
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}