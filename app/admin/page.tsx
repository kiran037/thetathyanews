// File: app/admin/page.tsx
import Link from "next/link";
import { 
  FileText, 
  Users, 
  Eye, 
  MessageSquare, 
  CreditCard, 
  PlusCircle, 
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  Clock,
  Settings
} from "lucide-react";
import { getAdminMetrics, getAdminArticles, getAdminUsers } from "@/lib/data/admin";

export const metadata = {
  title: "Admin Dashboard - TheTathyaNews",
  description: "Overview and statistics of publication operations",
};

export default async function AdminDashboardPage() {
  const metrics = await getAdminMetrics();
  const recentArticlesData = await getAdminArticles({ limit: 5 });
  const recentUsersData = await getAdminUsers({ limit: 5 });

  const stats = [
    {
      label: "Total Articles",
      value: metrics.totalArticles,
      sub: `${metrics.publishedArticles} published · ${metrics.draftArticles} drafts`,
      icon: FileText,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      label: "Total Views",
      value: metrics.totalViews.toLocaleString(),
      sub: "Across all published pieces",
      icon: Eye,
      color: "text-green-500",
      bg: "bg-green-500/10",
    },
    {
      label: "Registered Users",
      value: metrics.totalUsers,
      sub: "Verified community readers",
      icon: Users,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
    {
      label: "Active Subscribers",
      value: metrics.activeSubscriptions,
      sub: "Paying Pro members",
      icon: CreditCard,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Publication Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Real-time operational metrics and content management
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/articles/new"
            className="btn-primary inline-flex items-center gap-2 px-4 py-2 text-sm"
          >
            <PlusCircle className="h-4 w-4" />
            New Article
          </Link>
          <Link
            href="/admin/settings"
            className="btn-secondary inline-flex items-center gap-2 px-4 py-2 text-sm"
          >
            <Settings className="h-4 w-4" />
            Settings
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-border bg-card p-6 shadow-sm"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-muted-foreground">
                {item.label}
              </span>
              <div className={`p-2.5 rounded-lg ${item.bg}`}>
                <item.icon className={`h-5 w-5 ${item.color}`} />
              </div>
            </div>
            <div className="text-3xl font-bold mb-1">{item.value}</div>
            <div className="text-xs text-muted-foreground">{item.sub}</div>
          </div>
        ))}
      </div>

      {/* Tables: Recent Articles & Recent Users */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Articles (2 Cols) */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold">Recent Articles</h2>
              <p className="text-xs text-muted-foreground">Latest satirical dispatches</p>
            </div>
            <Link
              href="/admin/articles"
              className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
            >
              View all ({metrics.totalArticles})
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground text-xs uppercase">
                  <th className="pb-3 font-semibold">Title</th>
                  <th className="pb-3 font-semibold">Author</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold text-right">Views</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentArticlesData.articles.length > 0 ? (
                  recentArticlesData.articles.map((art) => (
                    <tr key={art.id} className="hover:bg-muted/40 transition-colors">
                      <td className="py-3.5 pr-4">
                        <Link
                          href={`/article/${art.slug}`}
                          target="_blank"
                          className="font-medium hover:text-primary transition-colors line-clamp-1"
                        >
                          {art.title}
                        </Link>
                        <span className="text-xs text-muted-foreground">
                          {art.categoryName || "Uncategorized"}
                        </span>
                      </td>
                      <td className="py-3.5 pr-4 text-xs text-muted-foreground whitespace-nowrap">
                        {art.authorName || "Editorial Staff"}
                      </td>
                      <td className="py-3.5 pr-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                            art.status === "published"
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                              : art.status === "draft"
                              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {art.status}
                        </span>
                      </td>
                      <td className="py-3.5 text-right font-medium text-xs whitespace-nowrap">
                        {art.viewCount?.toLocaleString() || 0}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-muted-foreground">
                      No articles recorded.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Users (1 Col) */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold">Recent Users</h2>
              <p className="text-xs text-muted-foreground">Newly registered accounts</p>
            </div>
            <Link
              href="/admin/users"
              className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
            >
              View all
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="space-y-4">
            {recentUsersData.users.length > 0 ? (
              recentUsersData.users.map((u) => (
                <div key={u.id} className="flex items-center justify-between gap-3 text-sm">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">
                      {u.displayName || `${u.firstName || ""} ${u.lastName || ""}`.trim() || "User"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span className="px-2 py-0.5 rounded bg-muted text-xs font-medium uppercase text-muted-foreground">
                      {u.roles[0] || "reader"}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground text-center py-6">
                No users recorded.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
