///components/main/search-filters.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { X, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SearchFiltersProps {
  categories?: { name: string; slug: string }[];
  authors?: { displayName: string; slug: string }[];
}

export function SearchFilters({ categories = [], authors = [] }: SearchFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);

  const currentCategory = searchParams.get("category");
  const currentAuthor = searchParams.get("author");

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    
    params.set("page", "1"); // Reset to page 1 when filtering
    
    router.push(`/search?${params.toString()}`);
  };

  const clearFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("category");
    params.delete("author");
    params.set("page", "1");
    router.push(`/search?${params.toString()}`);
  };

  const hasActiveFilters = currentCategory || currentAuthor;

  return (
    <div className="space-y-4">
      {/* Filter Toggle Button - Mobile */}
      <div className="lg:hidden">
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="w-full gap-2"
        >
          <Filter className="h-4 w-4" />
          {showFilters ? "Hide Filters" : "Show Filters"}
          {hasActiveFilters && (
            <span className="ml-auto bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs">
              {(currentCategory ? 1 : 0) + (currentAuthor ? 1 : 0)}
            </span>
          )}
        </Button>
      </div>

      {/* Filters */}
      <div className={`space-y-6 ${showFilters ? "block" : "hidden lg:block"}`}>
        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2">
            <span className="text-sm font-medium">Active Filters:</span>
            {currentCategory && (
              <button
                onClick={() => updateFilter("category", null)}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm hover:bg-primary/20 transition-colors"
              >
                Category: {currentCategory}
                <X className="h-3 w-3" />
              </button>
            )}
            {currentAuthor && (
              <button
                onClick={() => updateFilter("author", null)}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm hover:bg-primary/20 transition-colors"
              >
                Author: {currentAuthor}
                <X className="h-3 w-3" />
              </button>
            )}
            <button
              onClick={clearFilters}
              className="text-sm text-muted-foreground hover:text-foreground underline"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Category Filter */}
        {categories.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold mb-3">Categories</h3>
            <div className="space-y-2">
              {categories.map((category) => (
                <button
                  key={category.slug}
                  onClick={() =>
                    updateFilter(
                      "category",
                      currentCategory === category.slug ? null : category.slug
                    )
                  }
                  className={`block w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                    currentCategory === category.slug
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-accent"
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Author Filter */}
        {authors.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold mb-3">Authors</h3>
            <div className="space-y-2">
              {authors.map((author) => (
                <button
                  key={author.slug}
                  onClick={() =>
                    updateFilter(
                      "author",
                      currentAuthor === author.slug ? null : author.slug
                    )
                  }
                  className={`block w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                    currentAuthor === author.slug
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-accent"
                  }`}
                >
                  {author.displayName}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}