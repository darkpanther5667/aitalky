"use client";

import React, { useEffect, useState } from "react";
import { Play, Pause, Square, Volume2, FastForward } from "lucide-react";
import { speechManager } from "@/lib/speech";

interface AudioPlayerBarProps {
  currentTitle: string;
  sourceName?: string;
  onStop: () => void;
}

export function AudioPlayerBar({ currentTitle, sourceName, onStop }: AudioPlayerBarProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!speechManager) return;

    const unsubscribe = speechManager.subscribe((active, text) => {
      setIsPlaying(active);
      if (active || text) {
        setVisible(true);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  if (!visible && !isPlaying) return null;

  const togglePlay = () => {
    if (!speechManager) return;
    if (isPlaying) {
      speechManager.pause();
    } else {
      speechManager.resume();
    }
  };

  const handleStop = () => {
    if (speechManager) {
      speechManager.stop();
    }
    setVisible(false);
    onStop();
  };

  const cycleRate = () => {
    if (!speechManager) return;
    const rates = [1.0, 1.2, 1.5, 0.9];
    const nextIdx = (rates.indexOf(playbackRate) + 1) % rates.length;
    const nextRate = rates[nextIdx];
    setPlaybackRate(nextRate);
    speechManager.setRate(nextRate);
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 max-w-2xl mx-auto z-50">
      <div className="bg-neutral-900/95 text-neutral-100 dark:bg-neutral-100/95 dark:text-neutral-900 backdrop-blur-md px-4 py-3 rounded-md shadow-2xl border border-neutral-700/60 dark:border-neutral-300/60 flex items-center justify-between gap-4 transition-all animate-in fade-in slide-in-from-bottom-2">
        {/* Equalizer & Title */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="flex items-end gap-0.5 h-4 w-4 shrink-0 text-emerald-400 dark:text-emerald-600">
            {isPlaying ? (
              <>
                <div className="w-1 bg-current wave-bar-1" />
                <div className="w-1 bg-current wave-bar-2" />
                <div className="w-1 bg-current wave-bar-3" />
                <div className="w-1 bg-current wave-bar-4" />
              </>
            ) : (
              <div className="w-full flex items-center justify-center">
                <Volume2 className="w-3.5 h-3.5 opacity-60" />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 dark:text-neutral-600 flex items-center gap-2">
              <span>aitalky voice narrator</span>
              {sourceName && (
                <>
                  <span>•</span>
                  <span>{sourceName}</span>
                </>
              )}
            </div>
            <p className="text-xs font-medium truncate">
              {currentTitle || "Reading dispatch briefing..."}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={cycleRate}
            className="text-[11px] font-mono px-1.5 py-0.5 border border-neutral-700 dark:border-neutral-300 rounded hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors"
            title="Speech speed"
          >
            {playbackRate}x
          </button>

          <button
            onClick={togglePlay}
            className="p-1.5 bg-white text-neutral-950 dark:bg-neutral-900 dark:text-white rounded-full hover:scale-105 active:scale-95 transition-transform"
            title={isPlaying ? "Pause" : "Resume"}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
          </button>

          <button
            onClick={handleStop}
            className="p-1.5 text-neutral-400 hover:text-white dark:text-neutral-600 dark:hover:text-neutral-950 transition-colors"
            title="Stop audio"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
          </button>
        </div>
      </div>
    </div>
  );
}
