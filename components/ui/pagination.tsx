///components/ui/pagination.tsx
"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  baseUrl,
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const getPageUrl = (page: number) => {
    const url = new URL(baseUrl, window.location.origin);
    url.searchParams.set("page", page.toString());
    return url.pathname + url.search;
  };

  const renderPageNumbers = () => {
    const pages: (number | string)[] = [];
    const showPages = 5;
    
    if (totalPages <= showPages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      {/* Previous Button */}
      {currentPage > 1 ? (
        <Link
          href={getPageUrl(currentPage - 1)}
          className="inline-flex items-center justify-center w-9 h-9 rounded-md border border-border bg-background hover:bg-accent transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
        </Link>
      ) : (
        <div className="inline-flex items-center justify-center w-9 h-9 rounded-md border border-border bg-background opacity-50 cursor-not-allowed">
          <ChevronLeft className="h-4 w-4" />
        </div>
      )}

      {/* Page Numbers */}
      {renderPageNumbers().map((page, index) => {
        if (page === "...") {
          return (
            <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground">
              ...
            </span>
          );
        }

        const pageNum = page as number;
        const isActive = pageNum === currentPage;

        return (
          <Link
            key={pageNum}
            href={getPageUrl(pageNum)}
            className={cn(
              "inline-flex items-center justify-center w-9 h-9 rounded-md border transition-colors text-sm font-medium",
              isActive
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border bg-background hover:bg-accent"
            )}
          >
            {pageNum}
          </Link>
        );
      })}

      {/* Next Button */}
      {currentPage < totalPages ? (
        <Link
          href={getPageUrl(currentPage + 1)}
          className="inline-flex items-center justify-center w-9 h-9 rounded-md border border-border bg-background hover:bg-accent transition-colors"
        >
          <ChevronRight className="h-4 w-4" />
        </Link>
      ) : (
        <div className="inline-flex items-center justify-center w-9 h-9 rounded-md border border-border bg-background opacity-50 cursor-not-allowed">
          <ChevronRight className="h-4 w-4" />
        </div>
      )}
    </div>
  );
}