import { db } from "@/db";
import { articles } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getLatestArticles() {
  return db
    .select()
    .from(articles)
    .where(eq(articles.status, "published"))
    .limit(10);
}
