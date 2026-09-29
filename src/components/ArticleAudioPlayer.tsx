"use client";

import React, { useState, useEffect } from "react";
import { Play, Pause, Volume2, FastForward } from "lucide-react";
import { speechManager } from "@/lib/speech";

interface ArticleAudioPlayerProps {
  title: string;
  author: string;
  summary: string;
  durationMinutes: number;
}

export function ArticleAudioPlayer({
  title,
  author,
  summary,
  durationMinutes,
}: ArticleAudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);

  useEffect(() => {
    if (!speechManager) return;
    const unsub = speechManager.subscribe((active) => {
      setIsPlaying(active);
    });
    return unsub;
  }, []);

  const togglePlay = () => {
    if (!speechManager) return;
    if (isPlaying) {
      speechManager.pause();
    } else {
      speechManager.speak(`${title}. Reported by ${author}. ${summary}`);
    }
  };

  const cycleRate = () => {
    if (!speechManager) return;
    const rates = [1.0, 1.25, 1.5];
    const nextIdx = (rates.indexOf(playbackRate) + 1) % rates.length;
    const next = rates[nextIdx];
    setPlaybackRate(next);
    speechManager.setRate(next);
  };

  return (
    <div className="my-6 p-4 rounded-lg bg-[#f4f4f2] dark:bg-[#1a1a18] border border-[#e8e8e6] dark:border-[#222220] flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <button
          onClick={togglePlay}
          className="w-10 h-10 rounded-full bg-[#141413] dark:bg-[#f3f3f0] text-white dark:text-[#141413] flex items-center justify-center hover:scale-105 transition-transform cursor-pointer"
          title={isPlaying ? "Pause audio" : "Listen to article"}
        >
          {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
        </button>

        <div>
          <div className="text-xs font-semibold text-[#141413] dark:text-[#f3f3f0] flex items-center gap-2">
            <Volume2 className="w-3.5 h-3.5" />
            <span>Listen to this story</span>
          </div>
          <p className="text-[11px] text-[#6b7280] dark:text-[#9ca3af]">
            Narrated edition • {durationMinutes} min read time
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs">
        <button
          onClick={cycleRate}
          className="px-2 py-1 rounded border border-[#d1d5db] dark:border-[#374151] text-[#141413] dark:text-[#f3f3f0] hover:bg-[#e5e7eb] dark:hover:bg-[#262626] transition-colors cursor-pointer text-[11px] font-mono"
          title="Playback speed"
        >
          {playbackRate}x
        </button>
      </div>
    </div>
  );
}
