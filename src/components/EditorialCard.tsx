"use client";

import React from "react";
import Link from "next/link";
import { Article } from "@/types/news";
import { Volume2, Bookmark } from "lucide-react";
import { speechManager } from "@/lib/speech";

interface EditorialCardProps {
  article: Article;
  isSaved: boolean;
  onToggleSave: (art: Article) => void;
  onSelectArticle: (art: Article) => void;
  showImage?: boolean;
}

export function EditorialCard({
  article,
  isSaved,
  onToggleSave,
  onSelectArticle,
  showImage = true,
}: EditorialCardProps) {
  const handleListen = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!speechManager) return;
    speechManager.speak(`${article.title}. Reported by ${article.author}. ${article.summary}`);
  };

  const formatRelativeTime = (iso: string) => {
    try {
      const diffMs = Date.now() - new Date(iso).getTime();
      const diffMins = Math.max(1, Math.floor(diffMs / (1000 * 60)));
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      return `${Math.floor(diffHours / 24)}d ago`;
    } catch {
      return "";
    }
  };

  return (
    <article className="group flex flex-col justify-between py-4 sm:py-6 border-b border-[#e8e8e6] dark:border-[#222220] transition-colors">
      <div>
        {/* Optional Image */}
        {showImage && article.imageUrl && (
          <Link
            href={`/news/${article.slug}`}
            className="aspect-[16/10] overflow-hidden rounded-md bg-[#f4f4f2] dark:bg-[#1a1a18] mb-3 sm:mb-3.5 block"
          >
            <img
              src={article.imageUrl}
              alt={article.title}
              className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
            />
          </Link>
        )}

        {/* Category & Time */}
        <div className="flex items-center justify-between text-xs text-[#6b7280] dark:text-[#9ca3af] mb-1.5 font-medium">
          <span className="uppercase tracking-wider text-[10px] sm:text-[11px] font-semibold text-[#141413] dark:text-[#f3f3f0]">
            {article.category}
          </span>
          <span className="text-[10px] sm:text-[11px]">{formatRelativeTime(article.publishedAt)}</span>
        </div>

        {/* Headline Link */}
        <Link href={`/news/${article.slug}`} className="block">
          <h3 className="text-base sm:text-xl font-serif font-bold text-[#141413] dark:text-[#f3f3f0] group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors leading-snug mb-1.5 sm:mb-2">
            {article.title}
          </h3>
        </Link>

        {/* Summary */}
        <p className="text-xs sm:text-sm text-[#4b5563] dark:text-[#9ca3af] leading-relaxed mb-3 sm:mb-4 line-clamp-3 font-sans">
          {article.summary}
        </p>
      </div>

      {/* Footer Byline & Controls */}
      <div className="pt-2 flex items-center justify-between text-xs text-[#6b7280] dark:text-[#9ca3af]">
        <div className="truncate max-w-[160px] sm:max-w-[200px]">
          <span className="font-medium text-[#141413] dark:text-[#f3f3f0]">
            {article.author || article.source}
          </span>
          <span className="mx-1 sm:mx-1.5">•</span>
          <span>{article.readingTimeMinutes} min</span>
        </div>

        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          <button
            onClick={handleListen}
            className="p-2 sm:p-1.5 rounded-full hover:bg-[#f4f4f2] dark:hover:bg-[#1a1a18] text-[#141413] dark:text-[#f3f3f0] transition-colors cursor-pointer"
            title="Listen to story"
          >
            <Volume2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleSave(article);
            }}
            className="p-2 sm:p-1.5 rounded-full hover:bg-[#f4f4f2] dark:hover:bg-[#1a1a18] text-[#141413] dark:text-[#f3f3f0] transition-colors cursor-pointer"
            title={isSaved ? "Saved" : "Save article"}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isSaved ? "fill-current" : ""}`} />
          </button>
        </div>
      </div>
    </article>
  );
}
