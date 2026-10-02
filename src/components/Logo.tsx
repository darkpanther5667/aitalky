"use client";

import React from "react";
import Link from "next/link";

interface LogoProps {
  className?: string;
  showSubtitle?: boolean;
  size?: "sm" | "md" | "lg";
}

export function Logo({ className = "", showSubtitle = true, size = "md" }: LogoProps) {
  const emblemClasses =
    size === "sm"
      ? "w-7 h-7 sm:w-8 sm:h-8 rounded-xl"
      : size === "lg"
      ? "w-9 h-9 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-xl sm:rounded-2xl"
      : "w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl";

  const textSize =
    size === "sm"
      ? "text-xl sm:text-2xl"
      : size === "lg"
      ? "text-3xl sm:text-5xl lg:text-6xl"
      : "text-2xl sm:text-3xl lg:text-4xl";

  const subtextSize =
    size === "sm"
      ? "text-[7px] sm:text-[8px] tracking-[0.18em]"
      : size === "lg"
      ? "text-[8px] sm:text-[10px] lg:text-[11px] tracking-[0.2em] sm:tracking-[0.25em]"
      : "text-[8px] sm:text-[9px] tracking-[0.2em]";

  return (
    <Link href="/" className={`inline-flex items-center gap-2.5 sm:gap-3.5 group cursor-pointer ${className}`}>
      {/* Precision Vector Emblem */}
      <div
        className={`relative shrink-0 flex items-center justify-center bg-gradient-to-br from-[#181816] via-[#111110] to-[#0a0a09] border border-[#2c2c28] dark:border-[#383834] shadow-sm transition-transform duration-300 group-hover:scale-105 ${emblemClasses}`}
      >
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full p-1.5"
        >
          {/* Serif 'a' glyph */}
          <path
            d="M17 32 C17 37 13 40 8 40 C3 40 0 37 0 32 C0 26 4 23 10 22 L17 21 L17 18 C17 13 14 11 9 11 C5 11 2 13 0 16 L-2 12 C1 8 6 6 12 6 C20 6 23 10 23 18 L23 35 C23 38 24 40 25 41 L21 42 C19 41 18 37 17 32 Z M17 25 L11 26 C6 27 3 29 3 32 C3 36 6 38 10 38 C14 38 17 34 17 28 L17 25 Z"
            fill="#ffffff"
            transform="scale(0.85) translate(4, 3)"
          />

          {/* Talky frequency waveform */}
          <rect x="27" y="22" width="2.5" height="10" rx="1.25" fill="#a1a19a" />
          <rect x="32" y="16" width="2.5" height="22" rx="1.25" fill="#ffffff" />
          <rect x="37" y="20" width="2.5" height="14" rx="1.25" fill="#a1a19a" />

          {/* Emerald Live Intelligence Beacon */}
          <circle cx="33.25" cy="10" r="2.5" fill="#10b981" />
        </svg>

        {/* Ambient emerald backlight on hover */}
        <div className="absolute inset-0 rounded-2xl bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      </div>

      {/* Typographic Masthead */}
      <div className="flex flex-col">
        <span
          className={`font-serif font-black tracking-tight text-[#141413] dark:text-[#f3f3f0] leading-none transition-colors ${textSize}`}
        >
          aitalky
        </span>
        {showSubtitle && (
          <span
            className={`font-sans font-bold uppercase text-[#6b7280] dark:text-[#9ca3af] mt-1 ${subtextSize}`}
          >
            AI Journalism & Research
          </span>
        )}
      </div>
    </Link>
  );
}

export function LogoIcon({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    <div
      className={`relative shrink-0 flex items-center justify-center rounded-xl bg-gradient-to-br from-[#181816] via-[#111110] to-[#0a0a09] border border-[#2c2c28] dark:border-[#383834] shadow-sm ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full p-1"
      >
        <path
          d="M17 32 C17 37 13 40 8 40 C3 40 0 37 0 32 C0 26 4 23 10 22 L17 21 L17 18 C17 13 14 11 9 11 C5 11 2 13 0 16 L-2 12 C1 8 6 6 12 6 C20 6 23 10 23 18 L23 35 C23 38 24 40 25 41 L21 42 C19 41 18 37 17 32 Z M17 25 L11 26 C6 27 3 29 3 32 C3 36 6 38 10 38 C14 38 17 34 17 28 L17 25 Z"
          fill="#ffffff"
          transform="scale(0.85) translate(4, 3)"
        />
        <rect x="27" y="22" width="2.5" height="10" rx="1.25" fill="#a1a19a" />
        <rect x="32" y="16" width="2.5" height="22" rx="1.25" fill="#ffffff" />
        <rect x="37" y="20" width="2.5" height="14" rx="1.25" fill="#a1a19a" />
        <circle cx="33.25" cy="10" r="2.5" fill="#10b981" />
      </svg>
    </div>
  );
}
