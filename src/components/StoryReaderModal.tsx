"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Article } from "@/types/news";
import { X, Volume2, Bookmark, Share2, Check, ExternalLink, ArrowRight, MessageCircle } from "lucide-react";
import { speechManager } from "@/lib/speech";

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
    const text = `${article.title}. Written by ${article.author}. ${article.summary}. ${article.content || ""}`;
    speechManager.speak(text);
  };

  const handleShare = async () => {
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
      setAnswers((prev) => [...prev, { q, a: data.reply || "Thank you for asking. Our editorial system has processed your question." }]);
    } catch {
      setAnswers((prev) => [...prev, { q, a: "Unable to process the query right now. Please try again." }]);
    } finally {
      setLoadingAnswer(false);
    }
  };

  const paragraphs = (article.content || article.summary)
    .split("\n\n")
    .filter((p) => p.trim().length > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/50 backdrop-blur-xs animate-in fade-in">
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
        <div className="overflow-y-auto p-6 sm:p-10 space-y-8">
          {/* Article Header */}
          <div className="max-w-2xl mx-auto space-y-4">
            <h1 className="text-2xl sm:text-4xl font-serif font-bold text-[#141413] dark:text-[#f3f3f0] leading-tight">
              {article.title}
            </h1>

            <div className="flex items-center justify-between text-xs text-[#6b7280] dark:text-[#9ca3af] pt-2 border-t border-[#f0f0ee] dark:border-[#1a1a18]">
              <div>
                <span className="font-semibold text-[#141413] dark:text-[#f3f3f0]">
                  By {article.author}
                </span>
                {article.authorRole && <span>, {article.authorRole}</span>}
              </div>
              <span>
                {new Date(article.publishedAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>

          {/* Featured Image */}
          {article.imageUrl && (
            <div className="max-w-2xl mx-auto overflow-hidden rounded-md">
              <img
                src={article.imageUrl}
                alt={article.title}
                className="w-full max-h-96 object-cover"
              />
            </div>
          )}

          {/* Lead Summary */}
          <div className="max-w-2xl mx-auto">
            <p className="text-base sm:text-lg font-serif italic text-[#4b5563] dark:text-[#9ca3af] leading-relaxed border-l-2 border-[#141413] dark:border-[#f3f3f0] pl-4 my-4">
              "{article.summary}"
            </p>
          </div>

          {/* Full Narrative Text Paragraphs */}
          <div className="max-w-2xl mx-auto space-y-5 font-serif text-base sm:text-lg text-[#27272a] dark:text-[#e4e4e7] leading-relaxed">
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

          {/* Dedicated Page Link Banner */}
          <div className="max-w-2xl mx-auto p-4 rounded-md bg-[#f4f4f2]/70 dark:bg-[#1a1a18]/70 border border-[#e8e8e6] dark:border-[#222220] flex items-center justify-between text-xs font-sans">
            <div>
              <span className="font-semibold text-black dark:text-white block">
                Reading in Quick Drawer
              </span>
              <span className="text-[#6b7280] dark:text-[#9ca3af]">
                Visit the permanent canonical story page for the full reading experience.
              </span>
            </div>
            <Link
              href={`/news/${article.slug}`}
              className="px-3 py-1.5 bg-[#141413] text-white dark:bg-[#f3f3f0] dark:text-[#141413] font-medium rounded text-xs flex items-center gap-1 shrink-0 hover:opacity-90 transition-opacity"
            >
              <span>Open Page</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Source Link */}
          <div className="max-w-2xl mx-auto pt-2 font-sans flex items-center justify-between text-xs text-[#6b7280] dark:text-[#9ca3af]">
            <span>Published by {article.source}</span>
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-medium text-[#141413] dark:text-[#f3f3f0] underline underline-offset-4 hover:opacity-80 transition-opacity"
            >
              <span>View Source Publication</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Reader Discussion / Q&A Box */}
          <div className="max-w-2xl mx-auto pt-6 border-t border-[#e8e8e6] dark:border-[#222220] font-sans">
            <div className="flex items-center gap-2 mb-2 text-sm font-serif font-bold text-[#141413] dark:text-[#f3f3f0]">
              <MessageCircle className="w-4 h-4" />
              <span>Questions &amp; Analysis</span>
            </div>
            <p className="text-xs text-[#6b7280] dark:text-[#9ca3af] mb-4">
              Have a question about what this means for you or your team? Ask here for an editorial synthesis.
            </p>

            {/* Q&A Thread */}
            {answers.length > 0 && (
              <div className="space-y-3 mb-4">
                {answers.map((item, idx) => (
                  <div key={idx} className="p-3.5 rounded-md bg-[#f4f4f2] dark:bg-[#1a1a18] text-xs space-y-1.5 border border-[#e8e8e6] dark:border-[#222220]">
                    <div className="font-semibold text-black dark:text-white">Q: {item.q}</div>
                    <div className="text-[#4b5563] dark:text-[#9ca3af] leading-relaxed whitespace-pre-line">
                      {item.a}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={handleAskQuestion} className="flex gap-2">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="e.g. How does this compare to earlier architectures?"
                className="flex-1 bg-[#f4f4f2] dark:bg-[#1a1a18] border border-[#e8e8e6] dark:border-[#222220] rounded-md px-3 py-2 text-xs text-[#141413] dark:text-[#f3f3f0] placeholder:text-[#9ca3af] focus:outline-none focus:border-black dark:focus:border-white transition-colors"
              />
              <button
                type="submit"
                disabled={loadingAnswer || !question.trim()}
                className="px-4 py-2 bg-[#141413] text-white dark:bg-[#f3f3f0] dark:text-[#141413] text-xs font-medium rounded-md hover:opacity-90 disabled:opacity-50 transition-opacity cursor-pointer"
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
