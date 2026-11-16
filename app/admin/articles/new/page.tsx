// File: app/admin/articles/new/page.tsx
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getCategories } from "@/lib/data/categories";
import { getAuthors } from "@/lib/data/authors";
import { AdminArticleForm } from "./form-client";

export const metadata = {
  title: "Create Article - TheTathyaNews Admin",
  description: "Draft and publish a new satirical article",
};

export default async function NewArticlePage() {
  const [categoriesData, authorsData] = await Promise.all([
    getCategories({ limit: 50 }),
    getAuthors({ limit: 50 }),
  ]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/articles"
          className="p-2 rounded-lg border border-border hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Compose Satirical Piece</h1>
          <p className="text-xs text-muted-foreground">Draft and publish news to the Tathya wire</p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <AdminArticleForm
          categories={categoriesData.categories}
          authors={authorsData.authors}
        />
      </div>
    </div>
  );
}
