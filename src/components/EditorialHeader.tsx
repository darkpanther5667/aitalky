"use client";

import React, { useState, useEffect } from "react";
import { Category } from "@/types/news";
import { Search, Sun, Moon, Bookmark, X, Volume2, User, LogOut } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { AuthModal } from "@/components/AuthModal";
import { Logo } from "@/components/Logo";

interface EditorialHeaderProps {
  currentCategory: Category;
  onSelectCategory: (cat: Category) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  savedCount: number;
  showingSavedOnly: boolean;
  onToggleSavedOnly: () => void;
  onPlayBriefing: () => void;
  isAudioPlaying: boolean;
}

export function EditorialHeader({
  currentCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  savedCount,
  showingSavedOnly,
  onToggleSavedOnly,
  onPlayBriefing,
  isAudioPlaying,
}: EditorialHeaderProps) {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    setMounted(true);
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const stored = localStorage.getItem("aitalky-theme");
    const activeDark = stored ? stored === "dark" : prefersDark;
    setIsDark(activeDark);
    if (activeDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    // Check active Supabase session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUserEmail(session.user.email || null);
        setUserAvatar(session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture || null);
        setUserName(session.user.user_metadata?.full_name || session.user.user_metadata?.name || null);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email || null);
      setUserAvatar(session?.user?.user_metadata?.avatar_url || session?.user?.user_metadata?.picture || null);
      setUserName(session?.user?.user_metadata?.full_name || session?.user?.user_metadata?.name || null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUserEmail(null);
    setUserAvatar(null);
    setUserName(null);
  };

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("aitalky-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("aitalky-theme", "light");
    }
  };

  const categories: { id: Category; label: string }[] = [
    { id: "all", label: "All Stories" },
    { id: "industry", label: "Industry" },
    { id: "research", label: "Research & Science" },
    { id: "products", label: "Products & Tools" },
    { id: "culture", label: "Culture & Society" },
    { id: "policy", label: "Policy & Law" },
  ];

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <header className="border-b border-[#e8e8e6] dark:border-[#222220] bg-[var(--background)] transition-colors sticky top-0 z-40">
      {/* Top Meta Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex items-center justify-between text-xs text-[#6b7280] dark:text-[#9ca3af] border-b border-[#f0f0ee] dark:border-[#1a1a18]">
        <div className="flex items-center gap-3">
          <span>{currentDate}</span>
          <span className="hidden sm:inline text-neutral-300 dark:text-neutral-700">•</span>
          <span className="hidden sm:inline font-medium">Independent AI Journalism</span>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={onPlayBriefing}
            className={`flex items-center gap-1.5 transition-colors cursor-pointer text-xs font-medium ${
              isAudioPlaying
                ? "text-emerald-600 dark:text-emerald-400 font-semibold"
                : "hover:text-black dark:hover:text-white"
            }`}
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>{isAudioPlaying ? "Playing Daily Audio Brief" : "Daily Audio Brief (3m)"}</span>
          </button>

          <button
            onClick={onToggleSavedOnly}
            className={`flex items-center gap-1 transition-colors cursor-pointer ${
              showingSavedOnly
                ? "text-black dark:text-white font-semibold"
                : "hover:text-black dark:hover:text-white"
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${showingSavedOnly ? "fill-current" : ""}`} />
            <span className="hidden sm:inline">Saved</span>
            <span>({savedCount})</span>
          </button>

          <button
            onClick={toggleTheme}
            className="hover:text-black dark:hover:text-white transition-colors cursor-pointer p-0.5"
            aria-label="Toggle dark mode"
          >
            {mounted && isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>

          {userEmail ? (
            <div className="flex items-center gap-2 pl-2 border-l border-[#e8e8e6] dark:border-[#222220]">
              {userAvatar ? (
                <img
                  src={userAvatar}
                  alt={userName || userEmail}
                  className="w-5 h-5 rounded-full object-cover border border-[#e8e8e6] dark:border-[#333]"
                />
              ) : (
                <div className="w-5 h-5 rounded-full bg-[#141413] dark:bg-[#f3f3f0] text-white dark:text-[#141413] text-[10px] flex items-center justify-center font-bold">
                  {(userName || userEmail)[0].toUpperCase()}
                </div>
              )}
              <span className="text-xs text-[#141413] dark:text-[#f3f3f0] font-medium hidden md:inline truncate max-w-[130px]">
                {userName || userEmail}
              </span>
              <button
                onClick={handleSignOut}
                title="Sign Out"
                className="text-[#9ca3af] hover:text-black dark:hover:text-white transition-colors cursor-pointer p-0.5"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#141413] dark:bg-[#f3f3f0] text-white dark:text-[#141413] text-xs font-medium hover:opacity-90 transition-opacity cursor-pointer"
            >
              <User className="w-3 h-3" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Masthead */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <Logo size="lg" />

        {/* Search Bar */}
        <div className="w-full sm:w-72 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search stories, topics, reporters..."
            className="w-full bg-[#f4f4f2] dark:bg-[#1a1a18] border border-transparent focus:border-[#d1d5db] dark:focus:border-[#374151] rounded-full pl-9 pr-8 py-1.5 text-xs text-[#141413] dark:text-[#f3f3f0] placeholder:text-[#9ca3af] focus:outline-none transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-black dark:hover:text-white"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Clean Category Navigation */}
      <nav className="border-t border-[#e8e8e6] dark:border-[#222220] overflow-x-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-start sm:justify-center gap-6 sm:gap-8 py-2.5 text-xs sm:text-sm font-medium whitespace-nowrap scrollbar-none">
          {categories.map((cat) => {
            const isSelected = !showingSavedOnly && currentCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  if (showingSavedOnly) onToggleSavedOnly();
                  onSelectCategory(cat.id);
                }}
                className={`transition-colors cursor-pointer py-1 ${
                  isSelected
                    ? "text-[#141413] dark:text-[#f3f3f0] font-semibold border-b-2 border-[#141413] dark:border-[#f3f3f0]"
                    : "text-[#6b7280] dark:text-[#9ca3af] hover:text-[#141413] dark:hover:text-[#f3f3f0]"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </nav>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={(email) => setUserEmail(email)}
      />
    </header>
  );
}
