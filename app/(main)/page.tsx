///app/(main)/page.tsx
import Link from "next/link";
import { TrendingUp } from "lucide-react";
import { db } from "@/db";
import { articles, categories, authors } from "@/db/schema";
import { eq, desc, and, gt } from "drizzle-orm";
import { FeaturedArticle } from "@/components/main/featured-article";
import { ArticleCard } from "@/components/main/article-card";

export const metadata = {
  title: "TheTathyaNews - Satirical News & Commentary",
  description: "Your source for satirical news and fictional commentary on current events.",
};

export const revalidate = 300; // Revalidate every 5 minutes

async function getFeaturedArticle() {
  const [featured] = await db
    .select({
      id: articles.id,
      slug: articles.slug,
      title: articles.title,
      excerpt: articles.excerpt,
      coverImageUrl: articles.coverImageUrl,
      readingTimeMinutes: articles.readingTimeMinutes,
      commentCount: articles.commentCount,
      categoryName: categories.name,
      authorName: authors.displayName,
    })
    .from(articles)
    .leftJoin(categories, eq(articles.categoryId, categories.id))
    .leftJoin(authors, eq(articles.primaryAuthorId, authors.id))
    .where(
      and(
        eq(articles.status, "published"),
        eq(articles.visibility, "public"),
        eq(articles.isFeatured, true)
      )
    )
    .orderBy(desc(articles.publishedAt))
    .limit(1);

  return featured;
}

async function getLatestArticles() {
  return await db
    .select({
      id: articles.id,
      slug: articles.slug,
      title: articles.title,
      excerpt: articles.excerpt,
      coverImageUrl: articles.coverImageUrl,
      readingTimeMinutes: articles.readingTimeMinutes,
      viewCount: articles.viewCount,
      commentCount: articles.commentCount,
      categoryName: categories.name,
      categorySlug: categories.slug,
      authorName: authors.displayName,
      authorSlug: authors.slug,
      publishedAt: articles.publishedAt,
    })
    .from(articles)
    .leftJoin(categories, eq(articles.categoryId, categories.id))
    .leftJoin(authors, eq(articles.primaryAuthorId, authors.id))
    .where(
      and(
        eq(articles.status, "published"),
        eq(articles.visibility, "public")
      )
    )
    .orderBy(desc(articles.publishedAt))
    .limit(6);
}

async function getTrendingArticles() {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  return await db
    .select({
      id: articles.id,
      slug: articles.slug,
      title: articles.title,
      viewCount: articles.viewCount,
      categoryName: categories.name,
      publishedAt: articles.publishedAt,
    })
    .from(articles)
    .leftJoin(categories, eq(articles.categoryId, categories.id))
    .where(
      and(
        eq(articles.status, "published"),
        eq(articles.visibility, "public"),
        gt(articles.publishedAt, oneWeekAgo)
      )
    )
    .orderBy(desc(articles.viewCount))
    .limit(4);
}

export default async function HomePage() {
  const [featuredArticle, latestArticles, trendingArticles] = await Promise.all([
    getFeaturedArticle(),
    getLatestArticles(),
    getTrendingArticles(),
  ]);

  return (
    <div className="space-y-8">
      {/* Breaking News Banner */}
      <div className="breaking-badge">
        <span className="inline-block w-2 h-2 rounded-full bg-white animate-pulse" />
        BREAKING NEWS
      </div>

      {/* Featured Article */}
      {featuredArticle && <FeaturedArticle article={featuredArticle} />}

      {/* Latest Articles Grid */}
      {latestArticles.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Latest Stories</h2>
            <Link href="/search" className="link text-sm font-medium">
              View All →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {latestArticles.map((article, index) => (
              <ArticleCard 
                key={article.id} 
                article={article}
                priority={index < 3}
              />
            ))}
          </div>
        </div>
      )}

      {/* Trending Section */}
      {trendingArticles.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold">Trending This Week</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {trendingArticles.map((article, index) => (
              <Link
                key={article.id}
                href={`/article/${article.slug}`}
                className="flex gap-4 group"
              >
                <span className="flex-shrink-0 w-10 h-10 rounded bg-primary/10 text-primary font-bold text-lg flex items-center justify-center">
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  {article.categoryName && (
                    <span className="badge-default text-[10px] mb-1">
                      {article.categoryName.toUpperCase()}
                    </span>
                  )}
                  <h3 className="text-sm font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {article.viewCount ? `${(article.viewCount / 1000).toFixed(1)}K` : "0"} views •{" "}
                    {article.publishedAt
                      ? new Date(article.publishedAt).toLocaleDateString()
                      : "Recently"}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Newsletter CTA */}
      <div className="rounded-lg border border-border bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-8 text-center">
        <h2 className="text-2xl font-bold mb-2">Never Miss a Satirical Story</h2>
        <p className="text-muted-foreground mb-6">
          Subscribe to our newsletter for weekly doses of satire delivered to your inbox.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <input
            type="email"
            placeholder="Enter your email"
            className="newsletter-input flex-1"
          />
          <button className="btn-primary px-8 py-2">Subscribe</button>
        </div>
      </div>
    </div>
  );
}