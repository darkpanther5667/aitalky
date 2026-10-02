"use client";

import React from "react";
import Link from "next/link";
import { Article } from "@/types/news";
import { Volume2, Bookmark, ExternalLink, Sparkles } from "lucide-react";
import { speechManager } from "@/lib/speech";
import { TypographicCardFallback } from "./TypographicCardFallback";

interface EditorialCardProps {
  article: Article;
  isSaved: boolean;
  onToggleSave: (art: Article) => void;
  onSelectArticle?: (art: Article) => void;
  showImage?: boolean;
}

export function EditorialCard({
  article,
  isSaved,
  onToggleSave,
  showImage = true,
}: EditorialCardProps) {
  const handleListen = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!speechManager) return;
    const textToRead = article.aiSummary || article.summary;
    speechManager.speak(`${article.title}. Published via ${article.source}. ${textToRead}`);
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

  // Honest attribution logic:
  // If author provided: "{Author} · via {Source}"
  // Otherwise: "via {Source}"
  const renderAttribution = () => {
    const author = (article.author || "").trim();
    const source = (article.source || "").trim();
    if (author && author !== source && !author.toLowerCase().includes("staff") && !author.toLowerCase().includes("team")) {
      return (
        <span>
          <span className="font-semibold text-[#141413] dark:text-[#f3f3f0]">{author}</span>
          <span className="text-[#6b7280] dark:text-[#9ca3af]"> · via {source}</span>
        </span>
      );
    }
    return (
      <span className="font-medium text-[#141413] dark:text-[#f3f3f0]">
        via {source}
      </span>
    );
  };

  return (
    <article className="group flex flex-col justify-between py-4 sm:py-6 border-b border-[#e8e8e6] dark:border-[#222220] transition-colors">
      <div>
        {/* Real image or Typographic Fallback */}
        {showImage && (
          <Link
            href={`/news/${article.slug}`}
            className="aspect-[16/10] overflow-hidden rounded-md bg-[#f4f4f2] dark:bg-[#1a1a18] mb-3 sm:mb-3.5 block"
          >
            {article.imageUrl ? (
              <img
                src={article.imageUrl}
                alt={article.title}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                onError={(e) => {
                  // Fallback on image load error
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            ) : (
              <TypographicCardFallback
                category={article.category}
                source={article.source}
                title={article.title}
              />
            )}
          </Link>
        )}

        {/* Category & Time */}
        <div className="flex items-center justify-between text-xs text-[#6b7280] dark:text-[#9ca3af] mb-1.5 font-medium">
          <Link
            href={`/category/${article.category}`}
            className="uppercase tracking-wider text-[10px] sm:text-[11px] font-semibold text-[#141413] dark:text-[#f3f3f0] hover:underline"
          >
            {article.category}
          </Link>
          <span className="text-[10px] sm:text-[11px]">{formatRelativeTime(article.publishedAt)}</span>
        </div>

        {/* Headline Link */}
        <Link href={`/news/${article.slug}`} className="block">
          <h3 className="text-base sm:text-xl font-serif font-bold text-[#141413] dark:text-[#f3f3f0] group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors leading-snug mb-1.5 sm:mb-2">
            {article.title}
          </h3>
        </Link>

        {/* Grounded Summary or Clean Excerpt */}
        {article.aiSummary ? (
          <div className="mb-3 sm:mb-4">
            <div className="flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400 font-semibold mb-1">
              <Sparkles className="w-3 h-3" />
              <span>Summary (AI-assisted)</span>
            </div>
            <p className="text-xs sm:text-sm text-[#4b5563] dark:text-[#9ca3af] leading-relaxed line-clamp-3 font-sans">
              {article.aiSummary}
            </p>
            {article.whyItMatters && (
              <p className="mt-1 text-xs text-[#6b7280] dark:text-[#9ca3af] italic">
                <span className="font-semibold not-italic text-[#141413] dark:text-[#f3f3f0]">Why it matters:</span> {article.whyItMatters}
              </p>
            )}
          </div>
        ) : (
          <p className="text-xs sm:text-sm text-[#4b5563] dark:text-[#9ca3af] leading-relaxed mb-3 sm:mb-4 line-clamp-3 font-sans">
            {article.summary}
          </p>
        )}

        {/* Multi-source coverage / Also covered by */}
        {article.alsoCoveredBy && article.alsoCoveredBy.length > 0 && (
          <div className="text-[11px] text-[#6b7280] dark:text-[#9ca3af] mb-3 flex flex-wrap items-center gap-1.5 bg-[#f7f7f5] dark:bg-[#161614] px-2.5 py-1.5 rounded border border-[#e8e8e6] dark:border-[#222220]">
            <span className="font-semibold text-[#141413] dark:text-[#e4e4e0]">Also covered by:</span>
            {article.alsoCoveredBy.map((cov, idx) => (
              <span key={idx} className="inline-flex items-center gap-0.5">
                <a
                  href={cov.url}
                  target="_blank"
                  rel="noopener nofollow"
                  className="underline hover:text-[#141413] dark:hover:text-[#f3f3f0] transition-colors"
                >
                  {cov.source}
                </a>
                <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                {idx < article.alsoCoveredBy!.length - 1 && <span className="opacity-40 ml-1">·</span>}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer Byline & Controls */}
      <div className="pt-2 flex items-center justify-between text-xs text-[#6b7280] dark:text-[#9ca3af]">
        <div className="truncate max-w-[170px] sm:max-w-[220px]">
          {renderAttribution()}
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
