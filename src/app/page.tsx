"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Article, Category, NewsFeedResponse } from "@/types/news";
import { EditorialHeader } from "@/components/EditorialHeader";
import { EditorialHero } from "@/components/EditorialHero";
import { EditorialCard } from "@/components/EditorialCard";
import { EditorialSidebar } from "@/components/EditorialSidebar";
import { StoryReaderModal } from "@/components/StoryReaderModal";
import { TalkyAssistantModal } from "@/components/TalkyAssistantModal";
import { AudioPlayerBar } from "@/components/AudioPlayerBar";
import { speechManager } from "@/lib/speech";
import { ArrowRight, Volume2, Bookmark, Sparkles } from "lucide-react";

export default function HomePage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [showingSavedOnly, setShowingSavedOnly] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);

  // Load saved bookmarks from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("aitalky-saved-ids");
      if (stored) {
        setSavedIds(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
  }, []);

  // Sync speech manager
  useEffect(() => {
    if (!speechManager) return;
    const unsub = speechManager.subscribe((playing) => {
      setIsAudioPlaying(playing);
    });
    return unsub;
  }, []);

  // Load live news feed
  const loadFeeds = async () => {
    try {
      const res = await fetch("/api/news");
      if (res.ok) {
        const data: NewsFeedResponse = await res.json();
        setArticles(data.articles);
      }
    } catch (err) {
      console.error("Failed to load news", err);
    }
  };

  useEffect(() => {
    loadFeeds();
  }, []);

  // Bookmark toggle
  const toggleSaveArticle = (art: Article) => {
    setSavedIds((prev) => {
      let next: string[];
      if (prev.includes(art.id)) {
        next = prev.filter((id) => id !== art.id);
      } else {
        next = [...prev, art.id];
      }
      try {
        localStorage.setItem("aitalky-saved-ids", JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  // Play Daily Briefing
  const handlePlayBriefing = () => {
    if (!speechManager || articles.length === 0) return;

    if (isAudioPlaying) {
      speechManager.stop();
      setIsAudioPlaying(false);
      return;
    }

    const topStories = articles.slice(0, 3);
    const spokenText =
      "Good morning. Here is the aitalky daily briefing for today. " +
      topStories
        .map(
          (art, idx) =>
            `First: ${art.title}. Reported by ${art.author}. ${art.summary}. `
        )
        .join(" ") +
      " That is today's briefing. Read full reporting and analysis at aitalky.";

    speechManager.speak(spokenText);
  };

  // Filtered stories
  const filteredArticles = useMemo(() => {
    return articles.filter((art) => {
      if (showingSavedOnly && !savedIds.includes(art.id)) {
        return false;
      }
      if (selectedCategory !== "all" && art.category !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = art.title.toLowerCase().includes(q);
        const matchesSummary = art.summary.toLowerCase().includes(q);
        const matchesAuthor = art.author.toLowerCase().includes(q);
        if (!matchesTitle && !matchesSummary && !matchesAuthor) {
          return false;
        }
      }
      return true;
    });
  }, [articles, showingSavedOnly, savedIds, selectedCategory, searchQuery]);

  const leadStory = filteredArticles[0] || articles[0];
  const secondaryStories = filteredArticles.slice(1, 4);
  const feedStories = filteredArticles.slice(4);

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] font-sans antialiased flex flex-col transition-colors">
      {/* Editorial Header */}
      <EditorialHeader
        currentCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        savedCount={savedIds.length}
        showingSavedOnly={showingSavedOnly}
        onToggleSavedOnly={() => setShowingSavedOnly(!showingSavedOnly)}
        onPlayBriefing={handlePlayBriefing}
        isAudioPlaying={isAudioPlaying}
      />

      {/* Breaking News Ticker Line */}
      <div className="border-b border-[#e8e8e6] dark:border-[#222220] py-2 px-4 sm:px-6 bg-[#f4f4f2]/60 dark:bg-[#161614]/60 text-xs">
        <div className="max-w-7xl mx-auto flex items-center gap-3 overflow-hidden">
          <span className="font-semibold text-black dark:text-white uppercase tracking-wider shrink-0 text-[11px]">
            Latest Wire
          </span>
          <span className="text-neutral-300 dark:text-neutral-700">•</span>
          <div className="flex items-center gap-6 overflow-x-auto whitespace-nowrap text-[#4b5563] dark:text-[#9ca3af] scrollbar-none">
            <span>European Union finalizes research guidance for open-source AI</span>
            <span>•</span>
            <span>Data center energy demands spur clean utility agreements</span>
            <span>•</span>
            <span>Developers adopt autonomous multi-agent engineering workflows</span>
            <span>•</span>
            <span>Test-time search gains momentum across academic evaluations</span>
          </div>
        </div>
      </div>

      {/* Main Frontpage Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Saved Articles Banner if active */}
        {showingSavedOnly && (
          <div className="mb-8 pb-4 border-b border-[#e8e8e6] dark:border-[#222220] flex items-center justify-between">
            <h2 className="text-2xl font-serif font-bold text-[#141413] dark:text-[#f3f3f0]">
              Your Saved Stories ({filteredArticles.length})
            </h2>
            <button
              onClick={() => setShowingSavedOnly(false)}
              className="text-xs font-medium text-[#6b7280] hover:text-black dark:hover:text-white underline cursor-pointer"
            >
              Return to Front Page
            </button>
          </div>
        )}

        {/* Empty Search State */}
        {filteredArticles.length === 0 ? (
          <div className="text-center py-24 max-w-md mx-auto">
            <h3 className="text-xl font-serif font-bold text-[#141413] dark:text-[#f3f3f0] mb-2">
              No matching stories found
            </h3>
            <p className="text-sm text-[#6b7280] dark:text-[#9ca3af] mb-6">
              We couldn't find any articles matching your search query. Try searching for different keywords or view all categories.
            </p>
            <button
              onClick={() => {
                setSelectedCategory("all");
                setSearchQuery("");
                setShowingSavedOnly(false);
              }}
              className="px-4 py-2 rounded-md bg-[#141413] text-white dark:bg-[#f3f3f0] dark:text-[#141413] text-xs font-medium cursor-pointer"
            >
              View All Stories
            </button>
          </div>
        ) : (
          <>
            {/* 1. Lead / Hero Feature Story */}
            {leadStory && !showingSavedOnly && (
              <EditorialHero
                article={leadStory}
                isSaved={savedIds.includes(leadStory.id)}
                onToggleSave={toggleSaveArticle}
                onSelectArticle={setSelectedArticle}
              />
            )}

            {/* 2. Secondary Featured Stories (3-column row) */}
            {secondaryStories.length > 0 && !showingSavedOnly && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 py-10 border-b border-[#e8e8e6] dark:border-[#222220]">
                {secondaryStories.map((story) => (
                  <EditorialCard
                    key={story.id}
                    article={story}
                    isSaved={savedIds.includes(story.id)}
                    onToggleSave={toggleSaveArticle}
                    onSelectArticle={setSelectedArticle}
                    showImage={true}
                  />
                ))}
              </div>
            )}

            {/* 3. The Feed & Sidebar Split */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 pt-10">
              {/* Left Column: All stories stream */}
              <div className="lg:col-span-8">
                <div className="flex items-center justify-between pb-4 border-b border-[#e8e8e6] dark:border-[#222220] mb-2">
                  <h3 className="text-xl font-serif font-bold text-[#141413] dark:text-[#f3f3f0]">
                    {showingSavedOnly ? "Saved Reading List" : "The Latest Reporting"}
                  </h3>
                  <span className="text-xs text-[#6b7280] dark:text-[#9ca3af]">
                    Updated continuously
                  </span>
                </div>

                <div className="divide-y divide-[#e8e8e6] dark:divide-[#222220]">
                  {(showingSavedOnly ? filteredArticles : feedStories).map((story) => (
                    <EditorialCard
                      key={story.id}
                      article={story}
                      isSaved={savedIds.includes(story.id)}
                      onToggleSave={toggleSaveArticle}
                      onSelectArticle={setSelectedArticle}
                      showImage={false}
                    />
                  ))}
                </div>
              </div>

              {/* Right Column: Editorial Sidebar */}
              <div className="lg:col-span-4">
                <EditorialSidebar
                  articles={articles}
                  onSelectArticle={setSelectedArticle}
                  onPlayBriefing={handlePlayBriefing}
                  isAudioPlaying={isAudioPlaying}
                />
              </div>
            </div>
          </>
        )}
      </main>

      {/* Reader Modal */}
      <StoryReaderModal
        article={selectedArticle}
        onClose={() => setSelectedArticle(null)}
        isSaved={selectedArticle ? savedIds.includes(selectedArticle.id) : false}
        onToggleSave={toggleSaveArticle}
      />

      {/* Floating Research Desk Button */}
      <button
        onClick={() => setIsAssistantOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-[#141413] dark:bg-[#f3f3f0] text-white dark:text-[#141413] px-4 py-2.5 rounded-full shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all text-xs font-medium flex items-center gap-2 cursor-pointer border border-white/20 dark:border-black/20"
      >
        <Sparkles className="w-3.5 h-3.5 text-amber-400 dark:text-amber-600" />
        <span>Ask Research Desk</span>
      </button>

      {/* Research Desk Assistant Modal */}
      <TalkyAssistantModal
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
      />

      {/* Audio Narration Bar */}
      <AudioPlayerBar
        currentTitle={selectedArticle?.title || "Daily Audio Briefing"}
        sourceName={selectedArticle?.source}
        onStop={() => setIsAudioPlaying(false)}
      />

      {/* Clean Editorial Footer */}
      <footer className="border-t border-[#e8e8e6] dark:border-[#222220] py-14 mt-16 bg-[#f4f4f2]/40 dark:bg-[#141412]/40 text-xs text-[#6b7280] dark:text-[#9ca3af]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div>
            <span className="text-2xl font-serif font-bold text-[#141413] dark:text-[#f3f3f0] block mb-2">
              aitalky
            </span>
            <p className="max-w-sm text-xs leading-relaxed text-[#4b5563] dark:text-[#9ca3af]">
              An independent news publication dedicated to clear, thoughtful reporting on artificial intelligence, computing, and culture.
            </p>
          </div>

          <div className="flex flex-wrap gap-10 text-xs">
            <div>
              <span className="font-semibold text-black dark:text-white block mb-2 uppercase tracking-wider text-[11px]">
                Sections
              </span>
              <ul className="space-y-1.5">
                <li><a href="#" className="hover:underline">Industry &amp; Startups</a></li>
                <li><a href="#" className="hover:underline">Research &amp; Science</a></li>
                <li><a href="#" className="hover:underline">Products &amp; Tools</a></li>
                <li><a href="#" className="hover:underline">Culture &amp; Ethics</a></li>
                <li><a href="#" className="hover:underline">Policy &amp; Law</a></li>
              </ul>
            </div>

            <div>
              <span className="font-semibold text-black dark:text-white block mb-2 uppercase tracking-wider text-[11px]">
                Editions
              </span>
              <ul className="space-y-1.5">
                <li><a href="#" className="hover:underline">Daily Audio Briefing</a></li>
                <li><a href="#" className="hover:underline">Weekly Newsletter</a></li>
                <li><a href="/api/news" className="hover:underline">RSS Feed</a></li>
              </ul>
            </div>

            <div>
              <span className="font-semibold text-black dark:text-white block mb-2 uppercase tracking-wider text-[11px]">
                About
              </span>
              <ul className="space-y-1.5">
                <li><a href="#" className="hover:underline">Editorial Standards</a></li>
                <li><a href="#" className="hover:underline">Masthead &amp; Staff</a></li>
                <li><a href="#" className="hover:underline">Contact the Newsroom</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 mt-8 border-t border-[#e8e8e6] dark:border-[#222220] flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#9ca3af]">
          <span>&copy; {new Date().getFullYear()} aitalky Media Group. All rights reserved.</span>
          <span className="mt-2 sm:mt-0">Independent Journalism • Clean, Minimal &amp; Human</span>
        </div>
      </footer>
    </div>
  );
}
