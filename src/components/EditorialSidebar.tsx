"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Article } from "@/types/news";
import { Play, Pause, Headphones } from "lucide-react";

interface EditorialSidebarProps {
  articles: Article[];
  onSelectArticle: (art: Article) => void;
  onPlayBriefing: () => void;
  isAudioPlaying: boolean;
}

export function EditorialSidebar({
  articles,
  onSelectArticle,
  onPlayBriefing,
  isAudioPlaying,
}: EditorialSidebarProps) {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      if (res.ok) {
        setSubscribed(true);
        setEmail("");
        setTimeout(() => {
          setSubscribed(false);
        }, 5000);
      }
    } catch {
      // Fallback
    } finally {
      setSubmitting(false);
    }
  };

  const trendingStories = articles.slice(0, 5);

  return (
    <div className="flex flex-col gap-10">
      {/* Daily Audio Briefing Card */}
      <div className="p-6 rounded-lg bg-[#f4f4f2] dark:bg-[#1a1a18] border border-[#e8e8e6] dark:border-[#222220]">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#6b7280] dark:text-[#9ca3af] uppercase tracking-wider mb-2">
          <Headphones className="w-3.5 h-3.5 text-black dark:text-white" />
          <span>The Daily Briefing</span>
        </div>

        <h3 className="font-serif font-bold text-lg text-[#141413] dark:text-[#f3f3f0] mb-2 leading-snug">
          Today in AI: The Shift Toward Efficient Reasoning
        </h3>

        <p className="text-xs text-[#4b5563] dark:text-[#9ca3af] leading-relaxed mb-4">
          A 3-minute spoken edition summarizing today's key stories, edited by our reporters.
        </p>

        <button
          onClick={onPlayBriefing}
          className="w-full py-2.5 px-4 rounded-md bg-[#141413] dark:bg-[#f3f3f0] text-white dark:text-[#141413] text-xs font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity cursor-pointer"
        >
          {isAudioPlaying ? (
            <>
              <Pause className="w-3.5 h-3.5 fill-current" />
              <span>Pause Spoken Edition</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Listen to Spoken Edition (3 min)</span>
            </>
          )}
        </button>
      </div>

      {/* Most Read / Trending Column */}
      <div>
        <h4 className="font-serif font-bold text-base text-[#141413] dark:text-[#f3f3f0] pb-3 border-b border-[#e8e8e6] dark:border-[#222220] mb-4">
          Most Read This Week
        </h4>

        <div className="divide-y divide-[#f0f0ee] dark:divide-[#1a1a18]">
          {trendingStories.map((story, idx) => (
            <Link
              key={story.id}
              href={`/news/${story.slug}`}
              className="py-3 flex gap-3.5 group cursor-pointer block"
            >
              <span className="font-serif text-lg font-bold text-[#9ca3af] group-hover:text-black dark:group-hover:text-white transition-colors">
                0{idx + 1}
              </span>
              <div>
                <h5 className="text-xs sm:text-sm font-medium text-[#141413] dark:text-[#f3f3f0] group-hover:underline underline-offset-4 leading-snug">
                  {story.title}
                </h5>
                <span className="text-[11px] text-[#6b7280] dark:text-[#9ca3af] mt-1 block">
                  {story.author} • {story.readingTimeMinutes} min read
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Newsletter Signup */}
      <div className="p-6 rounded-lg border border-[#e8e8e6] dark:border-[#222220]">
        <h4 className="font-serif font-bold text-base text-[#141413] dark:text-[#f3f3f0] mb-1.5">
          The aitalky Weekly
        </h4>
        <p className="text-xs text-[#6b7280] dark:text-[#9ca3af] leading-relaxed mb-4">
          Thoughtful, hype-free analysis of artificial intelligence delivered to your inbox every Friday morning.
        </p>

        <form onSubmit={handleSubscribe} className="space-y-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email address"
            className="w-full bg-[#f4f4f2] dark:bg-[#1a1a18] border border-[#e8e8e6] dark:border-[#222220] rounded-md px-3 py-2 text-xs text-[#141413] dark:text-[#f3f3f0] placeholder:text-[#9ca3af] focus:outline-none focus:border-black dark:focus:border-white transition-colors"
          />
          <button
            type="submit"
            className="w-full py-2 px-3 rounded-md bg-[#141413] dark:bg-[#f3f3f0] text-white dark:text-[#141413] text-xs font-medium hover:opacity-90 transition-opacity cursor-pointer"
          >
            {subscribed ? "Subscribed — Thank you" : "Subscribe to Weekly"}
          </button>
        </form>
        <span className="text-[10px] text-[#9ca3af] mt-2 block">
          No spam, no promotional junk. Unsubscribe at any time.
        </span>
      </div>
    </div>
  );
}
