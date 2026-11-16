
///app/(main)/bookmarks/collections/new/page.tsx
import { requireAuth } from "@/lib/auth-server";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { CollectionForm } from "@/components/main/bookmarks/collection-form";

export const metadata = {
  title: "New Collection - TheTathyaNews",
  description: "Create a new bookmark collection",
};

export default async function NewCollectionPage() {
  await requireAuth();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <Link
            href="/bookmarks/collections"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-3xl font-bold">Create Collection</h1>
        </div>
        <p className="text-muted-foreground">
          Organize your bookmarks with a new collection
        </p>
      </div>

      {/* Form */}
      <div className="rounded-lg border border-border bg-card p-6">
        <CollectionForm />
      </div>
    </div>
  );
}
