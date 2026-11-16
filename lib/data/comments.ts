// File: lib/data/comments.ts
import { db } from "@/db";
import { comments, users, articles } from "@/db/schema";
import { eq, and, desc, sql, isNull } from "drizzle-orm";

export interface CommentData {
  id: string;
  content: string;
  createdAt: Date | null;
  likeCount: number | null;
  replyCount: number | null;
  isEdited: boolean | null;
  user: {
    id: string | null;
    displayName: string | null;
    avatarUrl: string | null;
  };
}

export async function getArticleComments(
  slug: string,
  options: { page?: number; limit?: number } = {}
) {
  const page = options.page && options.page > 0 ? options.page : 1;
  const limit = options.limit && options.limit > 0 ? options.limit : 20;
  const offset = (page - 1) * limit;

  const article = await db.query.articles.findFirst({
    where: (articles, { eq }) => eq(articles.slug, slug),
    columns: { id: true },
  });

  if (!article) return null;

  const [{ count }] = await db
    .select({ count: sql<number>`cast(count(*) as int)` })
    .from(comments)
    .where(
      and(
        eq(comments.articleId, article.id),
        eq(comments.status, "approved"),
        isNull(comments.parentId),
        isNull(comments.deletedAt)
      )
    );

  const rawComments = await db
    .select({
      id: comments.id,
      content: comments.content,
      createdAt: comments.createdAt,
      likeCount: comments.likeCount,
      replyCount: comments.replyCount,
      isEdited: comments.isEdited,
      userId: users.id,
      userDisplayName: users.displayName,
      userAvatarUrl: users.avatarUrl,
    })
    .from(comments)
    .leftJoin(users, eq(comments.userId, users.id))
    .where(
      and(
        eq(comments.articleId, article.id),
        eq(comments.status, "approved"),
        isNull(comments.parentId),
        isNull(comments.deletedAt)
      )
    )
    .orderBy(desc(comments.createdAt))
    .limit(limit)
    .offset(offset);

  const total = Number(count) || 0;

  const formattedComments: CommentData[] = rawComments.map((c) => ({
    id: c.id,
    content: c.content,
    createdAt: c.createdAt,
    likeCount: c.likeCount,
    replyCount: c.replyCount,
    isEdited: c.isEdited,
    user: {
      id: c.userId,
      displayName: c.userDisplayName,
      avatarUrl: c.userAvatarUrl,
    },
  }));

  return {
    comments: formattedComments,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}
