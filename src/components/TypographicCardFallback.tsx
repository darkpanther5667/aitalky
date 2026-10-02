import React from "react";
import { Category } from "@/types/news";

interface TypographicCardFallbackProps {
  category: Category;
  source: string;
  title: string;
  className?: string;
}

const CATEGORY_COLORS: Record<Category, { bg: string; border: string; accent: string; badge: string }> = {
  industry: {
    bg: "bg-gradient-to-br from-[#1c2230] to-[#0f141f]",
    border: "border-sky-900/40",
    accent: "text-sky-400",
    badge: "bg-sky-500/10 text-sky-400 border-sky-500/20",
  },
  research: {
    bg: "bg-gradient-to-br from-[#241c2e] to-[#120e18]",
    border: "border-purple-900/40",
    accent: "text-purple-400",
    badge: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  },
  products: {
    bg: "bg-gradient-to-br from-[#162720] to-[#0c1612]",
    border: "border-emerald-900/40",
    accent: "text-emerald-400",
    badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  },
  culture: {
    bg: "bg-gradient-to-br from-[#2e1d1c] to-[#170e0e]",
    border: "border-amber-900/40",
    accent: "text-amber-400",
    badge: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  },
  policy: {
    bg: "bg-gradient-to-br from-[#28211a] to-[#14100c]",
    border: "border-orange-900/40",
    accent: "text-orange-400",
    badge: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  },
  all: {
    bg: "bg-gradient-to-br from-[#1c1d22] to-[#0f1013]",
    border: "border-neutral-800",
    accent: "text-neutral-400",
    badge: "bg-neutral-800 text-neutral-300 border-neutral-700",
  },
};

export function TypographicCardFallback({
  category,
  source,
  title,
  className = "",
}: TypographicCardFallbackProps) {
  const theme = CATEGORY_COLORS[category] || CATEGORY_COLORS.all;

  return (
    <div
      className={`relative w-full aspect-[16/10] rounded-md overflow-hidden p-4 sm:p-5 flex flex-col justify-between border ${theme.bg} ${theme.border} ${className}`}
    >
      {/* Subtle background ambient grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

      {/* Top Header: Category badge & aitalky watermark */}
      <div className="relative z-10 flex items-center justify-between">
        <span
          className={`text-[9px] sm:text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border ${theme.badge}`}
        >
          {category}
        </span>
        <span className="text-[10px] font-mono tracking-widest text-neutral-400/60 uppercase">
          aitalky dispatch
        </span>
      </div>

      {/* Center typography: Title preview */}
      <div className="relative z-10 my-auto py-2">
        <p className="font-serif italic text-sm sm:text-base text-neutral-200 line-clamp-3 leading-snug font-normal">
          &ldquo;{title}&rdquo;
        </p>
      </div>

      {/* Bottom source footer */}
      <div className="relative z-10 flex items-center justify-between pt-2 border-t border-white/5">
        <span className={`text-[11px] font-semibold tracking-wide ${theme.accent}`}>
          via {source}
        </span>
        <span className="text-[10px] text-neutral-400/70 font-mono">
          PRIMARY SOURCE
        </span>
      </div>
    </div>
  );
}
