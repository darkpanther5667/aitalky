"use client";

import React from "react";
import Link from "next/link";
import { Article } from "@/types/news";
import { Volume2, Bookmark, Share2, Check, Sparkles, ExternalLink } from "lucide-react";
import { speechManager } from "@/lib/speech";
import { TypographicCardFallback } from "./TypographicCardFallback";

interface EditorialHeroProps {
  article: Article;
  isSaved: boolean;
  onToggleSave: (art: Article) => void;
  onSelectArticle?: (art: Article) => void;
}

export function EditorialHero({
  article,
  isSaved,
  onToggleSave,
}: EditorialHeroProps) {
  const [copied, setCopied] = React.useState(false);

  const handleListen = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!speechManager) return;
    const textToRead = article.aiSummary || article.summary;
    const text = `${article.title}. Published via ${article.source}. ${textToRead}`;
    speechManager.speak(text);
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(`${article.title} - https://aitalky.vercel.app/news/${article.slug}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // ignore
    }
  };

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
    <article className="group grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 pb-7 sm:pb-10 border-b border-[#e8e8e6] dark:border-[#222220] transition-colors">
      {/* Hero Image or Typographic Fallback */}
      <Link
        href={`/news/${article.slug}`}
        className="lg:col-span-7 overflow-hidden rounded-md bg-[#f4f4f2] dark:bg-[#1a1a18] block mb-1 lg:mb-0"
      >
        <div className="aspect-[16/10] overflow-hidden">
          {article.imageUrl ? (
            <img
              src={article.imageUrl}
              alt={article.title}
              className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-700 ease-out"
              onError={(e) => {
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
        </div>
      </Link>

      {/* Hero Content */}
      <div className="lg:col-span-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 text-[11px] sm:text-xs font-medium text-[#6b7280] dark:text-[#9ca3af] uppercase tracking-wider mb-2">
            <span className="text-black dark:text-white font-semibold">Top Story</span>
            <span>•</span>
            <Link href={`/category/${article.category}`} className="hover:underline">
              {article.category}
            </Link>
          </div>

          <Link href={`/news/${article.slug}`} className="block">
            <h2 className="text-xl sm:text-3xl lg:text-4xl font-serif font-bold text-[#141413] dark:text-[#f3f3f0] group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors leading-[1.2] sm:leading-[1.15] mb-2.5 sm:mb-3.5">
              {article.title}
            </h2>
          </Link>

          {/* AI Summary or Clean Excerpt */}
          {article.aiSummary ? (
            <div className="mb-4 sm:mb-5">
              <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-semibold mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Summary (AI-assisted)</span>
              </div>
              <p className="text-xs sm:text-base text-[#4b5563] dark:text-[#9ca3af] leading-relaxed font-sans">
                {article.aiSummary}
              </p>
              {article.whyItMatters && (
                <p className="mt-2 text-xs sm:text-sm text-[#6b7280] dark:text-[#9ca3af] italic">
                  <span className="font-semibold not-italic text-[#141413] dark:text-[#f3f3f0]">Why it matters:</span> {article.whyItMatters}
                </p>
              )}
            </div>
          ) : (
            <p className="text-xs sm:text-base text-[#4b5563] dark:text-[#9ca3af] leading-relaxed mb-4 sm:mb-6 font-sans">
              {article.summary}
            </p>
          )}

          {/* Multi-source coverage / Also covered by */}
          {article.alsoCoveredBy && article.alsoCoveredBy.length > 0 && (
            <div className="text-xs text-[#6b7280] dark:text-[#9ca3af] mb-4 flex flex-wrap items-center gap-1.5 bg-[#f7f7f5] dark:bg-[#161614] px-3 py-2 rounded border border-[#e8e8e6] dark:border-[#222220]">
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
                  <ExternalLink className="w-3 h-3 opacity-60" />
                  {idx < article.alsoCoveredBy!.length - 1 && <span className="opacity-40 ml-1">·</span>}
                </span>
              ))}
            </div>
          )}

          {/* Key Bullet Highlights if authentic */}
          {article.keyPoints && article.keyPoints.length > 0 && (
            <div className="mb-4 sm:mb-6 space-y-1.5 sm:space-y-2 border-l-2 border-[#141413] dark:border-[#f3f3f0] pl-2.5 sm:pl-3 py-0.5">
              {article.keyPoints.slice(0, 2).map((point, idx) => (
                <p key={idx} className="text-[11px] sm:text-xs text-[#374151] dark:text-[#d1d5db] leading-relaxed">
                  {point}
                </p>
              ))}
            </div>
          )}
        </div>

        {/* Byline & Action Controls */}
        <div className="pt-3 sm:pt-4 border-t border-[#f0f0ee] dark:border-[#1a1a18] flex items-center justify-between text-xs text-[#6b7280] dark:text-[#9ca3af]">
          <div className="truncate max-w-[200px] sm:max-w-[280px]">
            {renderAttribution()}
            <span className="mx-1 sm:mx-1.5">•</span>
            <span>{article.readingTimeMinutes} min read</span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={handleListen}
              className="p-1.5 sm:p-2 rounded-full hover:bg-[#f4f4f2] dark:hover:bg-[#1a1a18] text-[#141413] dark:text-[#f3f3f0] transition-colors cursor-pointer"
              title="Listen to story"
            >
              <Volume2 className="w-4 h-4" />
            </button>

            <button
              onClick={handleShare}
              className="p-1.5 rounded-full hover:bg-[#f4f4f2] dark:hover:bg-[#1a1a18] text-[#141413] dark:text-[#f3f3f0] transition-colors cursor-pointer"
              title="Share"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
            </button>

            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleSave(article);
              }}
              className="p-1.5 rounded-full hover:bg-[#f4f4f2] dark:hover:bg-[#1a1a18] text-[#141413] dark:text-[#f3f3f0] transition-colors cursor-pointer"
              title={isSaved ? "Saved" : "Save article"}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? "fill-current" : ""}`} />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
