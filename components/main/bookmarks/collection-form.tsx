
///components/main/bookmarks/collection-form.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface CollectionFormProps {
  collection?: {
    id: string;
    name: string;
    description: string | null;
    isPublic: boolean;
  };
  onSuccess?: () => void;
}

export function CollectionForm({ collection, onSuccess }: CollectionFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: collection?.name || "",
    description: collection?.description || "",
    isPublic: collection?.isPublic || false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = collection
        ? "/api/bookmarks/collections"
        : "/api/bookmarks/collections";
      
      const method = collection ? "PATCH" : "POST";
      const body = collection
        ? { ...formData, id: collection.id }
        : formData;

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      toast.success(data.message);
      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/bookmarks/collections");
      }
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to save collection");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name" required>
          Collection Name
        </Label>
        <Input
          id="name"
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="My Reading List"
          required
          disabled={loading}
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="A brief description of this collection..."
          rows={3}
          disabled={loading}
          className="flex w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.isPublic}
            onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
            disabled={loading}
          />
          <div>
            <div className="font-medium text-sm">Make this collection public</div>
            <div className="text-xs text-muted-foreground">
              Anyone with the link can view this collection
            </div>
          </div>
        </label>
      </div>

      <div className="flex gap-3">
        <Button type="submit" loading={loading}>
          {collection ? "Update Collection" : "Create Collection"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}