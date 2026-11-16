// File: lib/data/admin.ts
import { db } from "@/db";
import {
  articles,
  users,
  subscriptions,
  comments,
  categories,
  authors,
  systemSettings,
  userRoles,
  roles,
  articleStatusEnum,
} from "@/db/schema";
import { eq, desc, and, sql, ilike, or, isNull } from "drizzle-orm";

export interface AdminMetrics {
  totalArticles: number;
  publishedArticles: number;
  draftArticles: number;
  totalViews: number;
  totalComments: number;
  totalUsers: number;
  activeSubscriptions: number;
}

export async function getAdminMetrics(): Promise<AdminMetrics> {
  const [totalArticles, publishedArticles, draftArticles, totalUsers, activeSubs, sumResult] =
    await Promise.all([
      db.$count(articles, isNull(articles.deletedAt)),
      db.$count(articles, and(eq(articles.status, "published"), isNull(articles.deletedAt))),
      db.$count(articles, and(eq(articles.status, "draft"), isNull(articles.deletedAt))),
      db.$count(users, isNull(users.deletedAt)),
      db.$count(subscriptions, eq(subscriptions.status, "active")),
      db
        .select({
          views: sql<number>`coalesce(sum(${articles.viewCount}), 0)::int`,
          comments: sql<number>`coalesce(sum(${articles.commentCount}), 0)::int`,
        })
        .from(articles)
        .where(isNull(articles.deletedAt)),
    ]);

  return {
    totalArticles,
    publishedArticles,
    draftArticles,
    totalViews: sumResult[0]?.views || 0,
    totalComments: sumResult[0]?.comments || 0,
    totalUsers,
    activeSubscriptions: activeSubs,
  };
}

export interface AdminArticleItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  status: typeof articleStatusEnum.enumValues[number];
  isFeatured: boolean | null;
  viewCount: number | null;
  commentCount: number | null;
  readingTimeMinutes: number | null;
  publishedAt: Date | null;
  createdAt: Date;
  categoryName: string | null;
  categorySlug: string | null;
  authorName: string | null;
  authorSlug: string | null;
}

export async function getAdminArticles(options: {
  page?: number;
  limit?: number;
  query?: string;
  status?: string;
  category?: string;
} = {}): Promise<{ articles: AdminArticleItem[]; total: number; totalPages: number }> {
  const page = options.page && options.page > 0 ? options.page : 1;
  const limit = options.limit && options.limit > 0 ? options.limit : 15;
  const offset = (page - 1) * limit;

  const conditions = [isNull(articles.deletedAt)];

  if (options.status && options.status !== "all") {
    conditions.push(eq(articles.status, options.status as any));
  }

  if (options.query) {
    conditions.push(
      or(
        ilike(articles.title, `%${options.query}%`),
        ilike(articles.slug, `%${options.query}%`)
      )!
    );
  }

  if (options.category && options.category !== "all") {
    conditions.push(eq(categories.slug, options.category));
  }

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(articles)
    .leftJoin(categories, eq(articles.categoryId, categories.id))
    .where(and(...conditions));

  const total = Number(count) || 0;

  const rawArticles = await db
    .select({
      id: articles.id,
      slug: articles.slug,
      title: articles.title,
      excerpt: articles.excerpt,
      status: articles.status,
      isFeatured: articles.isFeatured,
      viewCount: articles.viewCount,
      commentCount: articles.commentCount,
      readingTimeMinutes: articles.readingTimeMinutes,
      publishedAt: articles.publishedAt,
      createdAt: articles.createdAt,
      categoryName: categories.name,
      categorySlug: categories.slug,
      authorName: authors.displayName,
      authorSlug: authors.slug,
    })
    .from(articles)
    .leftJoin(categories, eq(articles.categoryId, categories.id))
    .leftJoin(authors, eq(articles.primaryAuthorId, authors.id))
    .where(and(...conditions))
    .orderBy(desc(articles.createdAt))
    .limit(limit)
    .offset(offset);

  return {
    articles: rawArticles,
    total,
    totalPages: Math.ceil(total / limit),
  };
}

export interface AdminUserItem {
  id: string;
  email: string;
  displayName: string | null;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  status: string;
  emailVerified: boolean | null;
  createdAt: Date;
  roles: string[];
}

export async function getAdminUsers(options: {
  page?: number;
  limit?: number;
  query?: string;
  status?: string;
} = {}): Promise<{ users: AdminUserItem[]; total: number; totalPages: number }> {
  const page = options.page && options.page > 0 ? options.page : 1;
  const limit = options.limit && options.limit > 0 ? options.limit : 15;
  const offset = (page - 1) * limit;

  const conditions = [isNull(users.deletedAt)];

  if (options.status && options.status !== "all") {
    conditions.push(eq(users.status, options.status as any));
  }

  if (options.query) {
    conditions.push(
      or(
        ilike(users.email, `%${options.query}%`),
        ilike(users.displayName, `%${options.query}%`)
      )!
    );
  }

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(users)
    .where(and(...conditions));

  const total = Number(count) || 0;

  const rawUsers = await db
    .select({
      id: users.id,
      email: users.email,
      displayName: users.displayName,
      firstName: users.firstName,
      lastName: users.lastName,
      avatarUrl: users.avatarUrl,
      status: users.status,
      emailVerified: users.emailVerified,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(and(...conditions))
    .orderBy(desc(users.createdAt))
    .limit(limit)
    .offset(offset);

  // Fetch roles for these users
  const userIds = rawUsers.map((u) => u.id);
  const userRolesMap: Record<string, string[]> = {};

  if (userIds.length > 0) {
    const rolesList = await db
      .select({
        userId: userRoles.userId,
        roleSlug: roles.slug,
        roleName: roles.name,
      })
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .where(
        and(
          sql`${userRoles.userId} IN ${userIds}`,
          or(isNull(userRoles.expiresAt), sql`${userRoles.expiresAt} > NOW()`)
        )
      );

    for (const r of rolesList) {
      if (!userRolesMap[r.userId]) {
        userRolesMap[r.userId] = [];
      }
      userRolesMap[r.userId].push(r.roleSlug);
    }
  }

  const mapped: AdminUserItem[] = rawUsers.map((u) => ({
    ...u,
    roles: userRolesMap[u.id] || ["reader"],
  }));

  return {
    users: mapped,
    total,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getAdminSettings(): Promise<Record<string, any>> {
  const settingsList = await db.select().from(systemSettings);

  const defaults: Record<string, any> = {
    site_name: "The Tathya News",
    site_tagline: "Satirical Journalism for the Enlightened Cynic",
    contact_email: "editorial@thetathyanews.com",
    allow_comments: true,
    require_comment_approval: false,
    enable_paywall: false,
    free_articles_limit: 5,
  };

  const current: Record<string, any> = { ...defaults };

  for (const s of settingsList) {
    current[s.key] = s.value;
  }

  return current;
}
