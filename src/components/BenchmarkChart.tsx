"use client";

import React from "react";
import { BENCHMARKS, BenchmarkMeta } from "@/lib/benchmarks-data";
import { Award, Info } from "lucide-react";

export interface BenchmarkComparisonItem {
  benchmarkId: string;
  scoreA?: number;
  scoreB?: number;
}

interface BenchmarkChartProps {
  modelAName: string;
  modelBName?: string;
  items: BenchmarkComparisonItem[];
  title?: string;
  subtitle?: string;
}

export function BenchmarkChart({
  modelAName,
  modelBName,
  items,
  title = "Verified Academic Benchmark Results",
  subtitle = "Scores compiled directly from published lab technical reports and peer evaluations. Scale is 0–100%.",
}: BenchmarkChartProps) {
  const isComparison = Boolean(modelBName);

  return (
    <div className="bg-[#fafaf8] dark:bg-[#161614] border border-[#e8e8e6] dark:border-[#222220] rounded-xl p-5 sm:p-7">
      <div className="mb-6 pb-4 border-b border-[#e8e8e6] dark:border-[#222220]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-serif text-lg sm:text-xl font-bold text-[#141413] dark:text-[#f3f3f0]">
              {title}
            </h3>
            <p className="text-xs text-[#6b7280] dark:text-[#9ca3af] mt-1">
              {subtitle}
            </p>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 text-xs font-medium">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-[#141413] dark:bg-[#f3f3f0] inline-block" />
              <span className="text-[#141413] dark:text-[#f3f3f0] font-semibold">{modelAName}</span>
            </div>
            {isComparison && (
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-emerald-600 dark:bg-emerald-400 inline-block" />
                <span className="text-[#141413] dark:text-[#f3f3f0] font-semibold">{modelBName}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {items.map((item) => {
          const meta = BENCHMARKS[item.benchmarkId];
          if (!meta) return null;

          const scoreA = item.scoreA;
          const scoreB = item.scoreB;

          // Winner calculations if comparing
          const hasBoth = typeof scoreA === "number" && typeof scoreB === "number";
          const aWins = hasBoth && scoreA! > scoreB!;
          const bWins = hasBoth && scoreB! > scoreA!;
          const delta = hasBoth ? Math.abs(Number((scoreA! - scoreB!).toFixed(1))) : 0;

          return (
            <div
              key={item.benchmarkId}
              className="p-3.5 sm:p-4 rounded-lg bg-[var(--background)] border border-[#e8e8e6] dark:border-[#242422] transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-2.5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-serif font-bold text-sm text-[#141413] dark:text-[#f3f3f0]">
                      {meta.name}
                    </span>
                    <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-[#f0f0ee] dark:bg-[#20201e] text-[#6b7280] dark:text-[#9ca3af]">
                      {meta.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#6b7280] dark:text-[#9ca3af] mt-0.5 line-clamp-1">
                    {meta.description}
                  </p>
                </div>

                {hasBoth && delta > 0 && (
                  <div className="flex items-center gap-1 text-[11px] font-mono shrink-0">
                    <Award className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span className="text-[#6b7280] dark:text-[#9ca3af]">Advantage:</span>
                    <strong
                      className={
                        aWins
                          ? "text-[#141413] dark:text-[#f3f3f0]"
                          : "text-emerald-700 dark:text-emerald-400"
                      }
                    >
                      {aWins ? modelAName : modelBName} (+{delta}%)
                    </strong>
                  </div>
                )}
              </div>

              {/* Bar for Model A */}
              {typeof scoreA === "number" && (
                <div className="space-y-1 mb-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[11px] text-[#6b7280] dark:text-[#9ca3af] truncate max-w-[200px]">
                      {modelAName}
                    </span>
                    <span className="font-mono font-bold text-xs text-[#141413] dark:text-[#f3f3f0]">
                      {scoreA.toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-3 rounded-full bg-[#eaeae8] dark:bg-[#252523] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#141413] dark:bg-[#f3f3f0] transition-all duration-700 ease-out"
                      style={{ width: `${Math.min(100, Math.max(0, scoreA))}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Bar for Model B (if comparison) */}
              {isComparison && typeof scoreB === "number" && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[11px] text-[#6b7280] dark:text-[#9ca3af] truncate max-w-[200px]">
                      {modelBName}
                    </span>
                    <span className="font-mono font-bold text-xs text-emerald-700 dark:text-emerald-400">
                      {scoreB.toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-3 rounded-full bg-[#eaeae8] dark:bg-[#252523] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-emerald-600 dark:bg-emerald-400 transition-all duration-700 ease-out"
                      style={{ width: `${Math.min(100, Math.max(0, scoreB))}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-5 pt-3 border-t border-[#e8e8e6] dark:border-[#222220] flex items-center gap-2 text-[11px] text-[#9ca3af]">
        <Info className="w-3.5 h-3.5 shrink-0" />
        <span>
          Evaluations strictly reflect primary evaluation protocols (0-shot CoT or 5-shot) documented by each system&apos;s authoring laboratory.
        </span>
      </div>
    </div>
  );
}
