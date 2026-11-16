// File: app/admin/articles/new/form-client.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface AdminArticleFormProps {
  categories: Array<{ id: string; name: string; slug: string }>;
  authors: Array<{ id: string; displayName: string; slug: string }>;
}

export function AdminArticleForm({ categories, authors }: AdminArticleFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    categoryId: categories[0]?.id || "",
    primaryAuthorId: authors[0]?.id || "",
    coverImageUrl: "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1200&auto=format&fit=crop&q=80",
    coverImageAlt: "",
    readingTimeMinutes: 4,
    status: "published",
    isFeatured: false,
  });

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const title = e.target.value;
    const autoSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    setFormData((prev) => ({
      ...prev,
      title,
      slug: prev.slug === "" || prev.slug === autoSlug.slice(0, -1) ? autoSlug : prev.slug,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/admin/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create article");
      }

      toast.success("Article created successfully!");
      router.push("/admin/articles");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to create article");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Title */}
        <div className="md:col-span-2 space-y-1.5">
          <label className="text-sm font-semibold">Article Headline</label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={handleTitleChange}
            placeholder="e.g. World Leaders Announce All Problems Will Be Fixed by Tuesday"
            className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Slug */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold">URL Slug</label>
          <input
            type="text"
            required
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            placeholder="world-leaders-fix-problems"
            className="w-full px-3.5 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Status */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold">Initial Status</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className="w-full px-3.5 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>

        {/* Category */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold">Category</label>
          <select
            value={formData.categoryId}
            onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
            className="w-full px-3.5 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Primary Author */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold">Primary Author</label>
          <select
            value={formData.primaryAuthorId}
            onChange={(e) => setFormData({ ...formData, primaryAuthorId: e.target.value })}
            className="w-full px-3.5 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {authors.map((a) => (
              <option key={a.id} value={a.id}>
                {a.displayName}
              </option>
            ))}
          </select>
        </div>

        {/* Cover Image URL */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold">Cover Image URL</label>
          <input
            type="url"
            value={formData.coverImageUrl}
            onChange={(e) => setFormData({ ...formData, coverImageUrl: e.target.value })}
            className="w-full px-3.5 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Reading Time */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold">Est. Reading Time (Minutes)</label>
          <input
            type="number"
            min="1"
            max="60"
            value={formData.readingTimeMinutes}
            onChange={(e) => setFormData({ ...formData, readingTimeMinutes: parseInt(e.target.value) || 1 })}
            className="w-full px-3.5 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Excerpt */}
        <div className="md:col-span-2 space-y-1.5">
          <label className="text-sm font-semibold">Short Teaser Excerpt</label>
          <textarea
            rows={2}
            value={formData.excerpt}
            onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
            placeholder="A compelling satirical summary that appears on cards and social feeds..."
            className="w-full px-3.5 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Body Content */}
        <div className="md:col-span-2 space-y-1.5">
          <label className="text-sm font-semibold">Article Content (HTML / Rich Text)</label>
          <textarea
            rows={8}
            required
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            placeholder="<p>GENEVA — In an unprecedented breakthrough...</p>"
            className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Featured Checkbox */}
        <div className="md:col-span-2 flex items-center gap-2">
          <input
            type="checkbox"
            id="isFeatured"
            checked={formData.isFeatured}
            onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
            className="rounded border-border text-primary focus:ring-primary h-4 w-4"
          />
          <label htmlFor="isFeatured" className="text-sm font-medium">
            Mark as Featured / Editor&apos;s Pick
          </label>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
        <button
          type="button"
          onClick={() => router.back()}
          className="btn-ghost px-4 py-2 text-sm"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="btn-primary inline-flex items-center gap-2 px-6 py-2 text-sm"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Publish Article
        </button>
      </div>
    </form>
  );
}
