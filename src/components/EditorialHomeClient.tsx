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
import { EditorialFooter } from "@/components/EditorialFooter";
import { speechManager } from "@/lib/speech";
import { RotateCw, Sparkles } from "lucide-react";

interface EditorialHomeClientProps {
  initialArticles: Article[];
  initialCategory?: Category;
}

export function EditorialHomeClient({
  initialArticles,
  initialCategory = "all",
}: EditorialHomeClientProps) {
  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [selectedCategory, setSelectedCategory] = useState<Category>(initialCategory);
  const [searchQuery, setSearchQuery] = useState("");
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [showingSavedOnly, setShowingSavedOnly] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load saved bookmarks from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("aitalky-saved-ids");
      if (stored) {
        setSavedIds(JSON.parse(stored));
      }
    } catch {}
  }, []);

  // Sync speech manager state
  useEffect(() => {
    if (!speechManager) return;
    const unsub = speechManager.subscribe((playing) => {
      setIsAudioPlaying(playing);
    });
    return unsub;
  }, []);

  // Load live news feed on demand
  const loadFeeds = async (force: boolean = false) => {
    setIsRefreshing(true);
    try {
      const url = force ? "/api/news?refresh=true" : "/api/news";
      const res = await fetch(url);
      if (res.ok) {
        const data: NewsFeedResponse = await res.json();
        if (data.articles && data.articles.length > 0) {
          setArticles(data.articles);
        }
      }
    } catch (err) {
      console.error("Failed to refresh news", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    // Scheduled auto-refresh every 30 minutes
    const interval = setInterval(() => {
      loadFeeds();
    }, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

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
      } catch {}
      return next;
    });
  };

  const handlePlayBriefing = () => {
    if (!speechManager || articles.length === 0) return;

    if (isAudioPlaying) {
      speechManager.stop();
      setIsAudioPlaying(false);
      return;
    }

    const topStories = articles.slice(0, 3);
    const spokenText =
      "Good day. Here is the aitalky briefing. " +
      topStories
        .map(
          (art) =>
            `${art.title}. Published via ${art.source}. ${art.aiSummary || art.summary}. `
        )
        .join(" ") +
      " Read full source reporting and continuous updates at aitalky.";

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
        const matchesAuthor = (art.author || "").toLowerCase().includes(q);
        const matchesSource = (art.source || "").toLowerCase().includes(q);
        if (!matchesTitle && !matchesSummary && !matchesAuthor && !matchesSource) {
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

      {/* Breaking News Ticker Line with 30-Minute Live Pulse */}
      <div className="border-b border-[#e8e8e6] dark:border-[#222220] py-1.5 sm:py-2 px-3 sm:px-6 bg-[#f4f4f2]/70 dark:bg-[#161614]/70 text-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-3 overflow-hidden">
          <div className="flex items-center gap-2 sm:gap-3 overflow-hidden min-w-0">
            <span className="font-semibold text-black dark:text-white uppercase tracking-wider shrink-0 text-[10px] sm:text-[11px] flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Live Wire
            </span>
            <span className="text-neutral-300 dark:text-neutral-700 shrink-0">•</span>
            <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto whitespace-nowrap text-[#4b5563] dark:text-[#9ca3af] scrollbar-none text-[11px] sm:text-xs">
              {articles.length > 0 ? (
                articles.slice(0, 6).map((art, idx) => (
                  <button
                    key={art.id || idx}
                    onClick={() => setSelectedArticle(art)}
                    className="hover:text-black dark:hover:text-white hover:underline transition text-left cursor-pointer shrink-0"
                  >
                    <span className="font-medium text-neutral-800 dark:text-neutral-200">[{art.source}]</span> {art.title}
                  </button>
                ))
              ) : (
                <span>Real-time intelligence monitoring active...</span>
              )}
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-1.5 sm:gap-2 pl-2 sm:pl-3 border-l border-[#e8e8e6] dark:border-[#222220]">
            <span className="hidden sm:inline-block text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
              Syncs every 30m
            </span>
            <button
              onClick={() => loadFeeds(true)}
              disabled={isRefreshing}
              title="Force sync freshest AI news"
              className="flex items-center gap-1 text-[10px] sm:text-[11px] font-medium text-[#4b5563] dark:text-[#9ca3af] hover:text-black dark:hover:text-white transition px-1.5 sm:px-2 py-0.5 rounded bg-white/80 dark:bg-neutral-800/80 border border-[#e8e8e6] dark:border-[#2a2a28] cursor-pointer"
            >
              <RotateCw className={`w-3 h-3 ${isRefreshing ? "animate-spin text-black dark:text-white" : ""}`} />
              <span>{isRefreshing ? "Syncing..." : "Sync"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Frontpage Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-5 sm:py-12">
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

      {/* Editorial Footer */}
      <EditorialFooter />
    </div>
  );
}
