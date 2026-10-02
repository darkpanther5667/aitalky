"use client";

import React from "react";
import Link from "next/link";
import { Article } from "@/types/news";
import { Volume2, Bookmark, Share2, Check } from "lucide-react";
import { speechManager } from "@/lib/speech";

interface EditorialHeroProps {
  article: Article;
  isSaved: boolean;
  onToggleSave: (art: Article) => void;
  onSelectArticle: (art: Article) => void;
}

export function EditorialHero({
  article,
  isSaved,
  onToggleSave,
  onSelectArticle,
}: EditorialHeroProps) {
  const [copied, setCopied] = React.useState(false);

  const handleListen = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!speechManager) return;
    const text = `${article.title}. Reported by ${article.author}. ${article.summary}`;
    speechManager.speak(text);
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(`${article.title} - https://aitalky.news/news/${article.slug}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // ignore
    }
  };

  return (
    <article className="group grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 pb-7 sm:pb-10 border-b border-[#e8e8e6] dark:border-[#222220] transition-colors">
      {/* Hero Image Link */}
      <Link
        href={`/news/${article.slug}`}
        className="lg:col-span-7 overflow-hidden rounded-md bg-[#f4f4f2] dark:bg-[#1a1a18] block mb-1 lg:mb-0"
      >
        <div className="aspect-[16/10] overflow-hidden">
          <img
            src={
              article.imageUrl ||
              "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80"
            }
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-700 ease-out"
          />
        </div>
      </Link>

      {/* Hero Content */}
      <div className="lg:col-span-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 text-[11px] sm:text-xs font-medium text-[#6b7280] dark:text-[#9ca3af] uppercase tracking-wider mb-2">
            <span className="text-black dark:text-white font-semibold">Special Report</span>
            <span>•</span>
            <span>{article.category}</span>
          </div>

          <Link href={`/news/${article.slug}`} className="block">
            <h2 className="text-xl sm:text-3xl lg:text-4xl font-serif font-bold text-[#141413] dark:text-[#f3f3f0] group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors leading-[1.2] sm:leading-[1.15] mb-2.5 sm:mb-3.5">
              {article.title}
            </h2>
          </Link>

          <p className="text-xs sm:text-base text-[#4b5563] dark:text-[#9ca3af] leading-relaxed mb-4 sm:mb-6 font-sans">
            {article.summary}
          </p>

          {/* Key Bullet Highlights */}
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
          <div className="truncate max-w-[170px] sm:max-w-[220px]">
            <span className="font-medium text-[#141413] dark:text-[#f3f3f0]">
              By {article.author || "Editorial Intelligence"}
            </span>
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
