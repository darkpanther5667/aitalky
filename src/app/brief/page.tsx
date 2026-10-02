import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock, ExternalLink, Sparkles, Volume2 } from "lucide-react";
import { getDbArticles } from "@/lib/db";
import { fetchLiveNews } from "@/lib/rss-sources";
import { EditorialFooter } from "@/components/EditorialFooter";
import { Logo } from "@/components/Logo";
import { Article } from "@/types/news";

export const revalidate = 1800; // 30-minute ISR

export const metadata: Metadata = {
  title: "Daily AI Briefing — Synthesis of Today's Frontier Developments | aitalky",
  description:
    "Curated daily synthesis analyzing the top artificial intelligence breakthroughs, machine learning preprints, and model releases with links to primary reporting.",
  alternates: {
    canonical: "https://aitalky.vercel.app/brief",
  },
  openGraph: {
    title: "Daily AI Briefing — Synthesis of Today's Frontier Developments | aitalky",
    description: "Curated daily synthesis analyzing the top artificial intelligence breakthroughs.",
    url: "https://aitalky.vercel.app/brief",
    siteName: "aitalky",
    images: [{ url: "https://aitalky.vercel.app/og-default.png", width: 1200, height: 630 }],
  },
};

export default async function DailyBriefPage() {
  let articles: Article[] = [];
  try {
    articles = await getDbArticles("all", 8);
  } catch {}

  if (!articles || articles.length === 0) {
    try {
      articles = await fetchLiveNews();
    } catch {}
  }

  const topStories = articles.slice(0, 5);

  const formattedDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] font-sans antialiased flex flex-col transition-colors">
      {/* Top Header */}
      <header className="border-b border-[#e8e8e6] dark:border-[#222220] py-3 sm:py-4 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between text-xs text-[#6b7280] dark:text-[#9ca3af]">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 hover:text-black dark:hover:text-white transition-colors font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Wire</span>
            </Link>
            <span className="text-neutral-300 dark:text-neutral-700">•</span>
            <Logo size="sm" showSubtitle={false} />
          </div>
          <span className="uppercase tracking-wider font-semibold text-[11px] text-amber-600 dark:text-amber-400">
            Daily Synthesis
          </span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <div className="mb-10 pb-6 border-b border-[#e8e8e6] dark:border-[#222220]">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Editorial Synthesis</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-[#141413] dark:text-[#f3f3f0] leading-tight mb-4">
            The Daily AI Brief
          </h1>

          <div className="flex items-center gap-4 text-xs text-[#6b7280] dark:text-[#9ca3af]">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formattedDate}</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>4 min read</span>
            </div>
            <span>•</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">Synced with Live Wire</span>
          </div>
        </div>

        {/* Executive Overview */}
        <div className="prose prose-neutral dark:prose-invert max-w-none mb-12">
          <p className="font-serif text-lg sm:text-xl text-[#374151] dark:text-[#d1d5db] leading-relaxed">
            Welcome to today&rsquo;s <strong>aitalky Daily Brief</strong>. Across global artificial intelligence laboratories and engineering teams, the primary focus today centers on persistent reasoning efficiency, infrastructure compute scaling, and open developer access.
          </p>
          <p className="font-sans text-sm text-[#4b5563] dark:text-[#9ca3af] leading-relaxed mt-3">
            Below is our synthesized analysis of the {topStories.length} most significant developments, with concise executive context and direct citations to original primary reporting.
          </p>
        </div>

        {/* Story Syntheses */}
        <div className="space-y-12">
          {topStories.map((story, idx) => {
            const hasAuthor = story.author && story.author !== story.source && !story.author.toLowerCase().includes("staff");
            const byline = hasAuthor ? `${story.author} · via ${story.source}` : `via ${story.source}`;

            return (
              <article
                key={story.id || idx}
                className="p-6 rounded-xl border border-[#e8e8e6] dark:border-[#222220] bg-[#fafaf8] dark:bg-[#141412] transition-colors"
              >
                <div className="flex items-center justify-between text-xs text-[#6b7280] dark:text-[#9ca3af] mb-2 font-medium">
                  <span className="font-mono text-neutral-400">0{idx + 1} / {story.category.toUpperCase()}</span>
                  <span>{byline}</span>
                </div>

                <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#141413] dark:text-[#f3f3f0] mb-3 leading-snug">
                  <Link href={`/news/${story.slug}`} className="hover:underline">
                    {story.title}
                  </Link>
                </h2>

                <div className="text-sm text-[#374151] dark:text-[#d1d5db] leading-relaxed mb-4">
                  {story.aiSummary || story.summary}
                </div>

                {story.whyItMatters && (
                  <div className="p-3 rounded bg-amber-500/5 border border-amber-500/15 text-xs text-[#4b5563] dark:text-[#9ca3af] mb-4">
                    <strong className="text-[#141413] dark:text-[#f3f3f0]">Why it matters:</strong> {story.whyItMatters}
                  </div>
                )}

                {story.alsoCoveredBy && story.alsoCoveredBy.length > 0 && (
                  <div className="text-xs text-[#6b7280] dark:text-[#9ca3af] mb-4 flex flex-wrap items-center gap-1.5">
                    <span className="font-semibold text-[#141413] dark:text-[#f3f3f0]">Concurrent reporting:</span>
                    {story.alsoCoveredBy.map((cov, cIdx) => (
                      <span key={cIdx} className="inline-flex items-center gap-0.5">
                        <a
                          href={cov.url}
                          target="_blank"
                          rel="noopener nofollow"
                          className="underline hover:text-[#141413] dark:hover:text-[#f3f3f0]"
                        >
                          {cov.source}
                        </a>
                        {cIdx < story.alsoCoveredBy!.length - 1 && <span className="opacity-40">·</span>}
                      </span>
                    ))}
                  </div>
                )}

                <div className="pt-3 border-t border-[#e8e8e6] dark:border-[#222220] flex items-center justify-between text-xs">
                  <Link
                    href={`/news/${story.slug}`}
                    className="font-semibold text-[#141413] dark:text-[#f3f3f0] underline"
                  >
                    View aitalky Card &amp; Audio →
                  </Link>

                  <a
                    href={story.url}
                    target="_blank"
                    rel="noopener nofollow"
                    className="inline-flex items-center gap-1 text-[#6b7280] dark:text-[#9ca3af] hover:text-black dark:hover:text-white"
                  >
                    <span>Read full story at {story.source}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      </main>

      <EditorialFooter />
    </div>
  );
}
