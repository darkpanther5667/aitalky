"use client";

import React, { useState } from "react";
import { Bookmark, Heart, Share2, Sparkles, Check } from "lucide-react";
import { TalkyAssistantModal } from "@/components/TalkyAssistantModal";
import { supabase } from "@/lib/supabase";

interface ArticleActionsProps {
  slug: string;
  title: string;
  summary: string;
  initialLikes?: number;
}

export function ArticleActions({
  slug,
  title,
  summary,
  initialLikes = 0,
}: ArticleActionsProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [hasLiked, setHasLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);

  const handleLike = async () => {
    if (hasLiked) return;
    setHasLiked(true);
    setLikes((prev) => prev + 1);

    try {
      // Optimistically increment via Supabase REST API
      await supabase.rpc("increment_likes", { article_slug: slug });
    } catch {
      // Ignore
    }
  };

  const handleBookmark = async () => {
    const nextSaved = !isSaved;
    setIsSaved(nextSaved);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        await fetch("/api/bookmarks", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ slug }),
        });
      }
    } catch {
      // Fallback
    }
  };

  const handleShare = async () => {
    if (typeof window !== "undefined") {
      try {
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(window.location.href);
          setCopied(true);
          setTimeout(() => setCopied(false), 3000);
        }
      } catch {
        // Fallback
      }
    }
  };

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 py-3 px-4 my-6 rounded-lg bg-[#f4f4f2] dark:bg-[#1a1a18] border border-[#e8e8e6] dark:border-[#222220]">
        <div className="flex items-center gap-3">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 text-xs font-medium py-1.5 px-3 rounded-md transition-colors cursor-pointer ${
              hasLiked
                ? "bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400"
                : "hover:bg-white dark:hover:bg-[#252523] text-[#4b5563] dark:text-[#9ca3af]"
            }`}
            title="Applaud story"
          >
            <Heart className={`w-3.5 h-3.5 ${hasLiked ? "fill-current" : ""}`} />
            <span>{likes > 0 ? likes : "Applaud"}</span>
          </button>

          <button
            onClick={handleBookmark}
            className={`flex items-center gap-1.5 text-xs font-medium py-1.5 px-3 rounded-md transition-colors cursor-pointer ${
              isSaved
                ? "bg-black text-white dark:bg-white dark:text-black"
                : "hover:bg-white dark:hover:bg-[#252523] text-[#4b5563] dark:text-[#9ca3af]"
            }`}
            title={isSaved ? "Saved to reading list" : "Save for later"}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isSaved ? "fill-current" : ""}`} />
            <span>{isSaved ? "Saved" : "Save"}</span>
          </button>

          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 text-xs font-medium py-1.5 px-3 rounded-md hover:bg-white dark:hover:bg-[#252523] text-[#4b5563] dark:text-[#9ca3af] transition-colors cursor-pointer"
            title="Copy share link"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                  Link Copied
                </span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>Share</span>
              </>
            )}
          </button>
        </div>

        <button
          onClick={() => setIsAssistantOpen(true)}
          className="flex items-center gap-1.5 text-xs font-medium py-1.5 px-3 rounded-md bg-[#141413] dark:bg-[#f3f3f0] text-white dark:text-[#141413] hover:opacity-90 transition-opacity cursor-pointer ml-auto"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400 dark:text-amber-600" />
          <span>Ask Research Desk</span>
        </button>
      </div>

      <TalkyAssistantModal
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        articleTitle={title}
        articleContext={summary}
      />
    </>
  );
}
