"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, RefreshCw } from "lucide-react";

export default function ArticleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("News page error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex items-center justify-center p-6">
      <div className="max-w-md text-center space-y-4">
        <h1 className="font-serif text-2xl font-bold text-[#141413] dark:text-[#f3f3f0]">
          Unable to Load Story
        </h1>
        <p className="text-xs text-[#6b7280] dark:text-[#9ca3af] leading-relaxed">
          A temporary network delay occurred while retrieving this dispatch.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="inline-flex items-center gap-2 py-2 px-4 rounded-md border border-[#e8e8e6] dark:border-[#222220] hover:bg-[#f4f4f2] dark:hover:bg-[#1a1a18] text-xs font-medium transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 py-2 px-4 rounded-md bg-[#141413] dark:bg-[#f3f3f0] text-white dark:text-[#141413] text-xs font-medium hover:opacity-90 transition-opacity"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
