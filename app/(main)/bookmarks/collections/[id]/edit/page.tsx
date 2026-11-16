// File: app/(main)/bookmarks/collections/[id]/edit/page.tsx
import { requireAuth } from "@/lib/auth-server";
import { db } from "@/db";
import { bookmarkCollections } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { CollectionForm } from "@/components/main/bookmarks/collection-form";
import { notFound } from "next/navigation";

interface EditCollectionPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCollectionPage({ params }: EditCollectionPageProps) {
  const user = await requireAuth();
  const { id } = await params;

  const [collection] = await db
    .select()
    .from(bookmarkCollections)
    .where(eq(bookmarkCollections.id, id))
    .limit(1);

  if (!collection || collection.userId !== user.id) {
    notFound();
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <Link
            href={`/bookmarks/collections/${id}`}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-3xl font-bold">Edit Collection</h1>
        </div>
        <p className="text-muted-foreground">
          Update your collection details
        </p>
      </div>

      {/* Form */}
      <div className="rounded-lg border border-border bg-card p-6">
        <CollectionForm 
          collection={{
            ...collection,
            // FIX: Fallback to false if isPublic is null
            isPublic: collection.isPublic ?? false, 
          }} 
        />
      </div>
    </div>
  );
}