"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Article } from "@/types/news";
import { X, Volume2, Bookmark, Share2, Check, ExternalLink, ArrowRight, Sparkles } from "lucide-react";
import { speechManager } from "@/lib/speech";
import { TypographicCardFallback } from "./TypographicCardFallback";

interface StoryReaderModalProps {
  article: Article | null;
  onClose: () => void;
  isSaved: boolean;
  onToggleSave: (art: Article) => void;
}

export function StoryReaderModal({
  article,
  onClose,
  isSaved,
  onToggleSave,
}: StoryReaderModalProps) {
  const [copied, setCopied] = useState(false);
  const [question, setQuestion] = useState("");
  const [answers, setAnswers] = useState<{ q: string; a: string }[]>([]);
  const [loadingAnswer, setLoadingAnswer] = useState(false);

  if (!article) return null;

  const handleListen = () => {
    if (!speechManager) return;
    const textToRead = article.aiSummary || article.summary;
    const text = `${article.title}. Published via ${article.source}. ${textToRead}`;
    speechManager.speak(text);
  };

  const handleShare = async () => {
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

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || loadingAnswer) return;

    const q = question.trim();
    setQuestion("");
    setLoadingAnswer(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: q,
          articleTitle: article.title,
          articleContext: `${article.summary} ${article.content || ""}`,
        }),
      });
      const data = await res.json();
      setAnswers((prev) => [...prev, { q, a: data.reply || "Thank you for asking. Our editorial assistant has processed your question." }]);
    } catch {
      setAnswers((prev) => [...prev, { q, a: "Unable to process the query right now. Please try again." }]);
    } finally {
      setLoadingAnswer(false);
    }
  };

  const paragraphs = (article.content || article.summary)
    .split("\n\n")
    .filter((p) => p.trim().length > 0);

  const hasAuthor = article.author && article.author !== article.source && !article.author.toLowerCase().includes("staff");
  const authorDisplay = hasAuthor ? `${article.author} · via ${article.source}` : `via ${article.source}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-[var(--background)] border border-[#e8e8e6] dark:border-[#222220] w-full max-w-3xl max-h-[92vh] flex flex-col rounded-lg shadow-2xl overflow-hidden">
        {/* Top Control Bar */}
        <div className="flex items-center justify-between border-b border-[#e8e8e6] dark:border-[#222220] px-6 py-3 text-xs text-[#6b7280] dark:text-[#9ca3af]">
          <div className="flex items-center gap-2">
            <span className="uppercase font-semibold tracking-wider text-[#141413] dark:text-[#f3f3f0]">
              {article.category}
            </span>
            <span>•</span>
            <span>{article.readingTimeMinutes} min read</span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/news/${article.slug}`}
              className="flex items-center gap-1 text-black dark:text-white font-medium hover:underline text-xs"
            >
              <span>Full Page</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <button
              onClick={handleListen}
              className="flex items-center gap-1.5 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
              title="Listen to story"
            >
              <Volume2 className="w-4 h-4" />
              <span className="hidden sm:inline">Listen</span>
            </button>

            <button
              onClick={handleShare}
              className="p-1 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
              title="Share story link"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
            </button>

            <button
              onClick={() => onToggleSave(article)}
              className="p-1 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
              title={isSaved ? "Saved" : "Save story"}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? "fill-current" : ""}`} />
            </button>

            <button
              onClick={onClose}
              className="p-1 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Article Body */}
        <div className="overflow-y-auto p-6 sm:p-10 space-y-6">
          {/* Article Header */}
          <div className="max-w-2xl mx-auto space-y-3">
            <h1 className="text-2xl sm:text-4xl font-serif font-bold text-[#141413] dark:text-[#f3f3f0] leading-tight">
              {article.title}
            </h1>

            <div className="flex items-center justify-between text-xs text-[#6b7280] dark:text-[#9ca3af] pt-2 border-t border-[#f0f0ee] dark:border-[#1a1a18]">
              <span className="font-semibold text-[#141413] dark:text-[#f3f3f0]">
                {authorDisplay}
              </span>
              <span>
                {new Date(article.publishedAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>

          {/* Prominent Original Source Action Link */}
          <div className="max-w-2xl mx-auto p-3 rounded-lg bg-[#f4f4f2] dark:bg-[#161614] border border-[#e8e8e6] dark:border-[#262624] flex items-center justify-between text-xs">
            <span className="text-[#6b7280] dark:text-[#9ca3af]">Original report via <strong>{article.source}</strong></span>
            <a
              href={article.url}
              target="_blank"
              rel="noopener nofollow"
              className="inline-flex items-center gap-1 font-semibold text-black dark:text-white underline hover:opacity-80"
            >
              <span>Read the full story at {article.source}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Featured Image or Typographic Fallback */}
          <div className="max-w-2xl mx-auto overflow-hidden rounded-md">
            {article.imageUrl ? (
              <img
                src={article.imageUrl}
                alt={article.title}
                className="w-full max-h-96 object-cover"
              />
            ) : (
              <TypographicCardFallback
                category={article.category}
                source={article.source}
                title={article.title}
              />
            )}
          </div>

          {/* Grounded AI Summary */}
          {article.aiSummary ? (
            <div className="max-w-2xl mx-auto p-4 rounded-lg bg-amber-500/5 border border-amber-500/20">
              <div className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 font-bold mb-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Summary (AI-assisted)</span>
              </div>
              <p className="text-sm font-sans text-[#374151] dark:text-[#d1d5db] leading-relaxed">
                {article.aiSummary}
              </p>
              {article.whyItMatters && (
                <p className="mt-2 text-xs text-[#6b7280] dark:text-[#9ca3af] italic">
                  <span className="font-semibold not-italic text-[#141413] dark:text-[#f3f3f0]">Why it matters:</span> {article.whyItMatters}
                </p>
              )}
            </div>
          ) : (
            <div className="max-w-2xl mx-auto">
              <p className="text-base sm:text-lg font-serif italic text-[#4b5563] dark:text-[#9ca3af] leading-relaxed border-l-2 border-[#141413] dark:border-[#f3f3f0] pl-4 my-2">
                &ldquo;{article.summary}&rdquo;
              </p>
            </div>
          )}

          {/* Article Excerpt Body */}
          <div className="max-w-2xl mx-auto space-y-4 font-serif text-base sm:text-lg text-[#27272a] dark:text-[#e4e4e7] leading-relaxed">
            {paragraphs.map((p, idx) => (
              <p key={idx} className="leading-relaxed">
                {p}
              </p>
            ))}
          </div>

          {/* Key Takeaways */}
          {article.keyPoints && article.keyPoints.length > 0 && (
            <div className="max-w-2xl mx-auto p-5 rounded-md bg-[#f4f4f2] dark:bg-[#1a1a18] border border-[#e8e8e6] dark:border-[#222220]">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#6b7280] dark:text-[#9ca3af] block mb-2 font-sans">
                Key Points
              </span>
              <ul className="space-y-2 text-xs sm:text-sm text-[#374151] dark:text-[#d1d5db] font-sans">
                {article.keyPoints.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-black dark:text-white font-medium">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* External Source Link Footer */}
          <div className="max-w-2xl mx-auto pt-6 border-t border-[#e8e8e6] dark:border-[#222220] flex items-center justify-between text-xs text-[#6b7280] dark:text-[#9ca3af]">
            <span>Reported via {article.source}</span>
            <a
              href={article.url}
              target="_blank"
              rel="noopener nofollow"
              className="inline-flex items-center gap-1.5 font-semibold text-[#141413] dark:text-[#f3f3f0] underline underline-offset-4 hover:opacity-80"
            >
              <span>Read the full story at {article.source} ↗</span>
            </a>
          </div>

          {/* Research Desk Interactive Section */}
          <div className="max-w-2xl mx-auto mt-8 pt-6 border-t border-[#e8e8e6] dark:border-[#222220]">
            <h4 className="font-serif font-bold text-sm text-[#141413] dark:text-[#f3f3f0] mb-2">
              Ask Research Desk about this story
            </h4>

            {answers.length > 0 && (
              <div className="space-y-3 mb-4">
                {answers.map((item, idx) => (
                  <div key={idx} className="p-3.5 rounded bg-[#f4f4f2] dark:bg-[#1a1a18] text-xs space-y-1.5">
                    <p className="font-semibold text-black dark:text-white">&ldquo;{item.q}&rdquo;</p>
                    <p className="text-[#4b5563] dark:text-[#9ca3af] leading-relaxed">{item.a}</p>
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={handleAskQuestion} className="flex gap-2">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask about architectural impact, compute overhead, or background..."
                className="flex-1 bg-[#f4f4f2] dark:bg-[#1a1a18] border border-[#e8e8e6] dark:border-[#222220] rounded-md px-3 py-2 text-xs text-[#141413] dark:text-[#f3f3f0] placeholder:text-[#9ca3af] focus:outline-none focus:border-black dark:focus:border-white transition-colors"
              />
              <button
                type="submit"
                disabled={loadingAnswer}
                className="px-4 py-2 rounded-md bg-[#141413] dark:bg-[#f3f3f0] text-white dark:text-[#141413] text-xs font-medium hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
              >
                {loadingAnswer ? "Analyzing..." : "Ask"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
