// File: components/main/article/reading-progress.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import { ArrowDown, X, BookOpen } from "lucide-react";

interface ReadingProgressProps {
  articleId: string;
  slug: string;
  isAuthenticated: boolean;
}

export function ReadingProgress({ articleId, slug, isAuthenticated }: ReadingProgressProps) {
  const [progress, setProgress] = useState(0);
  const [maxScroll, setMaxScroll] = useState(0);
  const [resumePrompt, setResumePrompt] = useState<number | null>(null);
  const lastSavedRef = useRef<number>(0);
  const startTimeRef = useRef<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize start time on client mount
  useEffect(() => {
    startTimeRef.current = Date.now();
  }, []);

  // Check saved progress on mount for resume-reading
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`thetathya_progress_${slug}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.readPercentage >= 15 && parsed.readPercentage <= 85) {
          setTimeout(() => {
            setResumePrompt(parsed.readPercentage);
          }, 0);
        }
      }
    } catch {
      // Ignore local storage errors
    }
  }, [slug]);

  // Scroll tracking with throttling
  useEffect(() => {
    function handleScroll() {
      const articleEl = document.querySelector("article");
      if (!articleEl) return;

      const rect = articleEl.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const totalHeight = articleEl.offsetHeight;
      const scrolled = window.scrollY - articleEl.offsetTop + windowHeight;

      let currentPercent = Math.round((scrolled / totalHeight) * 100);
      currentPercent = Math.max(0, Math.min(100, currentPercent));

      setProgress(currentPercent);
      setMaxScroll((prev) => Math.max(prev, currentPercent));
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Sync progress periodically / debounced
  useEffect(() => {
    if (progress < 10) return;

    // Save locally for guest resume
    try {
      localStorage.setItem(
        `thetathya_progress_${slug}`,
        JSON.stringify({
          articleId,
          readPercentage: maxScroll,
          updatedAt: Date.now(),
        })
      );
    } catch {}

    // Only send API request if progress has advanced by >= 5% or reached completion
    if (Math.abs(maxScroll - lastSavedRef.current) < 5 && maxScroll < 90) {
      return;
    }

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(async () => {
      lastSavedRef.current = maxScroll;
      const timeSpent = Math.round((Date.now() - (startTimeRef.current || Date.now())) / 1000);

      try {
        await fetch("/api/main/reading-progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            articleId,
            readPercentage: maxScroll,
            scrollDepth: maxScroll,
            timeSpentSeconds: timeSpent,
            isCompleted: maxScroll >= 90,
          }),
        });
      } catch {
        // Silently ignore network hiccup
      }
    }, 4000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [maxScroll, progress, articleId, slug, isAuthenticated]);

  function handleResume() {
    if (!resumePrompt) return;
    const articleEl = document.querySelector("article");
    if (!articleEl) return;

    const targetY = articleEl.offsetTop + (articleEl.offsetHeight * (resumePrompt / 100)) - 100;
    window.scrollTo({ top: Math.max(0, targetY), behavior: "smooth" });
    setResumePrompt(null);
  }

  return (
    <>
      {/* Top Fixed Reading Progress Indicator */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-transparent">
        <div
          className="h-full bg-gradient-to-r from-primary to-orange-400 transition-all duration-150 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Resume Reading Floating Banner */}
      {resumePrompt !== null && (
        <div className="fixed bottom-6 right-6 z-40 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-primary/30 bg-card/95 backdrop-blur-sm shadow-xl text-sm">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
              <BookOpen className="h-4 w-4" />
            </div>
            <div>
              <p className="font-semibold text-xs text-foreground">Resume Reading?</p>
              <p className="text-[11px] text-muted-foreground">You left off at {resumePrompt}%</p>
            </div>
            <button
              type="button"
              onClick={handleResume}
              className="btn-primary text-xs px-3 py-1.5 ml-2 font-medium"
            >
              Resume
            </button>
            <button
              type="button"
              onClick={() => setResumePrompt(null)}
              className="p-1 rounded text-muted-foreground hover:text-foreground"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
