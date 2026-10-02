"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { AIModel } from "@/types/model";
import { MODEL_BENCHMARKS, POPULAR_COMPARISONS } from "@/lib/benchmarks-data";
import { BenchmarkChart, BenchmarkComparisonItem } from "@/components/BenchmarkChart";
import {
  ExternalLink,
  CheckCircle2,
  ArrowRightLeft,
  ArrowRight,
  Sparkles,
  Layers,
  Code,
  ShieldCheck,
} from "lucide-react";

interface ModelCompareClientProps {
  allModels: AIModel[];
  defaultModelAId?: string;
  defaultModelBId?: string;
}

export function ModelCompareClient({
  allModels,
  defaultModelAId = "deepseek-r1",
  defaultModelBId = "openai-o1",
}: ModelCompareClientProps) {
  const [modelAId, setModelAId] = useState(defaultModelAId);
  const [modelBId, setModelBId] = useState(defaultModelBId);

  const modelA = useMemo(
    () => allModels.find((m) => m.id === modelAId) || allModels[0],
    [allModels, modelAId]
  );
  const modelB = useMemo(
    () => allModels.find((m) => m.id === modelBId) || allModels[1] || allModels[0],
    [allModels, modelBId]
  );

  const swapModels = () => {
    const temp = modelAId;
    setModelAId(modelBId);
    setModelBId(temp);
  };

  // Compile benchmark comparison items
  const benchmarkItems: BenchmarkComparisonItem[] = useMemo(() => {
    const dataA = MODEL_BENCHMARKS[modelA.id]?.scores;
    const dataB = MODEL_BENCHMARKS[modelB.id]?.scores;

    if (!dataA && !dataB) return [];

    const keys = ["math500", "gpqa", "mmlu_pro", "swe_bench", "humaneval"] as const;
    const items: BenchmarkComparisonItem[] = [];

    for (const k of keys) {
      const scoreA = dataA?.[k];
      const scoreB = dataB?.[k];
      if (typeof scoreA === "number" || typeof scoreB === "number") {
        items.push({
          benchmarkId: k,
          scoreA,
          scoreB,
        });
      }
    }

    return items;
  }, [modelA.id, modelB.id]);

  return (
    <div className="space-y-8">
      {/* Popular Comparison Presets */}
      <div className="bg-[#fafaf8] dark:bg-[#161614] border border-[#e8e8e6] dark:border-[#222220] rounded-xl p-4 sm:p-5">
        <span className="text-[11px] uppercase tracking-wider font-mono font-semibold text-[#6b7280] dark:text-[#9ca3af] block mb-3">
          Popular Head-to-Head Showdowns
        </span>
        <div className="flex flex-wrap gap-2">
          {POPULAR_COMPARISONS.map((comp) => {
            const isActive =
              (modelAId === comp.modelAId && modelBId === comp.modelBId) ||
              (modelAId === comp.modelBId && modelBId === comp.modelAId);

            return (
              <button
                key={comp.slug}
                onClick={() => {
                  setModelAId(comp.modelAId);
                  setModelBId(comp.modelBId);
                }}
                className={`text-xs px-3 py-1.5 rounded-lg border transition cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? "bg-[#141413] text-white dark:bg-[#f3f3f0] dark:text-[#141413] border-transparent font-medium"
                    : "border-[#e8e8e6] dark:border-[#262624] bg-[var(--background)] hover:border-black dark:hover:border-white text-[#4b5563] dark:text-[#9ca3af]"
                }`}
              >
                <span>{comp.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Model Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center relative">
        {/* Model A Selector Card */}
        <div className="p-4 sm:p-5 rounded-xl border-2 border-[#141413] dark:border-[#f3f3f0] bg-[var(--background)]">
          <label className="block text-[11px] font-mono uppercase text-[#6b7280] dark:text-[#9ca3af] mb-1.5">
            Model A (Primary)
          </label>
          <select
            value={modelAId}
            onChange={(e) => setModelAId(e.target.value)}
            className="w-full text-base sm:text-lg font-serif font-bold text-[#141413] dark:text-[#f3f3f0] bg-transparent border-b border-[#e8e8e6] dark:border-[#222220] pb-1.5 focus:outline-none cursor-pointer"
          >
            {allModels.map((m) => (
              <option key={m.id} value={m.id} className="text-black bg-white dark:text-white dark:bg-[#1a1a18]">
                {m.name} ({m.lab})
              </option>
            ))}
          </select>
          <div className="mt-3 flex items-center justify-between text-xs text-[#6b7280] dark:text-[#9ca3af]">
            <span>{modelA.lab}</span>
            <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-[#f4f4f2] dark:bg-[#1f1f1d]">
              {modelA.accessType === "open_weights" ? "Open Weights" : "Commercial API"}
            </span>
          </div>
        </div>

        {/* Swap Button (floating on md screens) */}
        <button
          onClick={swapModels}
          className="md:absolute md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-10 w-9 h-9 rounded-full bg-[#141413] text-white dark:bg-[#f3f3f0] dark:text-[#141413] flex items-center justify-center shadow-md hover:scale-105 transition mx-auto cursor-pointer"
          title="Swap Models"
          aria-label="Swap Models"
        >
          <ArrowRightLeft className="w-4 h-4" />
        </button>

        {/* Model B Selector Card */}
        <div className="p-4 sm:p-5 rounded-xl border-2 border-emerald-600 dark:border-emerald-400 bg-[var(--background)]">
          <label className="block text-[11px] font-mono uppercase text-emerald-700 dark:text-emerald-400 mb-1.5">
            Model B (Comparison)
          </label>
          <select
            value={modelBId}
            onChange={(e) => setModelBId(e.target.value)}
            className="w-full text-base sm:text-lg font-serif font-bold text-[#141413] dark:text-[#f3f3f0] bg-transparent border-b border-[#e8e8e6] dark:border-[#222220] pb-1.5 focus:outline-none cursor-pointer"
          >
            {allModels.map((m) => (
              <option key={m.id} value={m.id} className="text-black bg-white dark:text-white dark:bg-[#1a1a18]">
                {m.name} ({m.lab})
              </option>
            ))}
          </select>
          <div className="mt-3 flex items-center justify-between text-xs text-[#6b7280] dark:text-[#9ca3af]">
            <span>{modelB.lab}</span>
            <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
              {modelB.accessType === "open_weights" ? "Open Weights" : "Commercial API"}
            </span>
          </div>
        </div>
      </div>

      {/* Benchmark Graph Section (if available) */}
      {benchmarkItems.length > 0 && (
        <BenchmarkChart
          modelAName={modelA.name}
          modelBName={modelB.name}
          items={benchmarkItems}
          title={`${modelA.name} vs ${modelB.name}: Verified Benchmark Duel`}
          subtitle="Head-to-head empirical results on published evaluation suites. All scores taken from verified lab papers."
        />
      )}

      {/* Side-by-Side Specifications Table */}
      <div className="bg-[#fafaf8] dark:bg-[#161614] border border-[#e8e8e6] dark:border-[#222220] rounded-xl overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-[#e8e8e6] dark:border-[#222220]">
          <h3 className="font-serif text-lg sm:text-xl font-bold text-[#141413] dark:text-[#f3f3f0]">
            Side-by-Side Architectural Specifications
          </h3>
          <p className="text-xs text-[#6b7280] dark:text-[#9ca3af] mt-1">
            Direct comparison of underlying neural architectures, context windows, parameter scales, and licensing models.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-[#e8e8e6] dark:border-[#222220] bg-[#f0f0ee]/50 dark:bg-[#1e1e1c]/50">
                <th className="p-3.5 sm:p-4 font-mono uppercase text-[#6b7280] dark:text-[#9ca3af] w-1/3">
                  Specification
                </th>
                <th className="p-3.5 sm:p-4 font-serif font-bold text-sm text-[#141413] dark:text-[#f3f3f0] w-1/3">
                  {modelA.name}
                </th>
                <th className="p-3.5 sm:p-4 font-serif font-bold text-sm text-emerald-700 dark:text-emerald-400 w-1/3">
                  {modelB.name}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e8e8e6] dark:divide-[#222220]">
              <tr>
                <td className="p-3.5 sm:p-4 font-medium text-[#6b7280] dark:text-[#9ca3af]">Developer / Lab</td>
                <td className="p-3.5 sm:p-4 font-semibold text-[#141413] dark:text-[#f3f3f0]">{modelA.lab}</td>
                <td className="p-3.5 sm:p-4 font-semibold text-[#141413] dark:text-[#f3f3f0]">{modelB.lab}</td>
              </tr>
              <tr>
                <td className="p-3.5 sm:p-4 font-medium text-[#6b7280] dark:text-[#9ca3af]">Primary Modality</td>
                <td className="p-3.5 sm:p-4 capitalize text-[#141413] dark:text-[#f3f3f0]">{modelA.modality}</td>
                <td className="p-3.5 sm:p-4 capitalize text-[#141413] dark:text-[#f3f3f0]">{modelB.modality}</td>
              </tr>
              <tr>
                <td className="p-3.5 sm:p-4 font-medium text-[#6b7280] dark:text-[#9ca3af]">Access &amp; Weights</td>
                <td className="p-3.5 sm:p-4 font-medium text-[#141413] dark:text-[#f3f3f0]">
                  {modelA.accessType === "open_weights" ? "Open Weights" : "Commercial API"}
                </td>
                <td className="p-3.5 sm:p-4 font-medium text-[#141413] dark:text-[#f3f3f0]">
                  {modelB.accessType === "open_weights" ? "Open Weights" : "Commercial API"}
                </td>
              </tr>
              <tr>
                <td className="p-3.5 sm:p-4 font-medium text-[#6b7280] dark:text-[#9ca3af]">Context Window</td>
                <td className="p-3.5 sm:p-4 font-mono font-semibold text-[#141413] dark:text-[#f3f3f0]">
                  {modelA.contextWindow}
                </td>
                <td className="p-3.5 sm:p-4 font-mono font-semibold text-[#141413] dark:text-[#f3f3f0]">
                  {modelB.contextWindow}
                </td>
              </tr>
              <tr>
                <td className="p-3.5 sm:p-4 font-medium text-[#6b7280] dark:text-[#9ca3af]">Parameters</td>
                <td className="p-3.5 sm:p-4 font-medium text-[#141413] dark:text-[#f3f3f0]">{modelA.parameters}</td>
                <td className="p-3.5 sm:p-4 font-medium text-[#141413] dark:text-[#f3f3f0]">{modelB.parameters}</td>
              </tr>
              <tr>
                <td className="p-3.5 sm:p-4 font-medium text-[#6b7280] dark:text-[#9ca3af]">License</td>
                <td className="p-3.5 sm:p-4 text-[#141413] dark:text-[#f3f3f0]">{modelA.license}</td>
                <td className="p-3.5 sm:p-4 text-[#141413] dark:text-[#f3f3f0]">{modelB.license}</td>
              </tr>
              <tr>
                <td className="p-3.5 sm:p-4 font-medium text-[#6b7280] dark:text-[#9ca3af]">Release Date</td>
                <td className="p-3.5 sm:p-4 text-[#141413] dark:text-[#f3f3f0]">{modelA.releaseDate}</td>
                <td className="p-3.5 sm:p-4 text-[#141413] dark:text-[#f3f3f0]">{modelB.releaseDate}</td>
              </tr>
              <tr>
                <td className="p-3.5 sm:p-4 font-medium text-[#6b7280] dark:text-[#9ca3af]">Neural Architecture</td>
                <td className="p-3.5 sm:p-4 leading-relaxed text-[#141413] dark:text-[#f3f3f0]">
                  {modelA.architecture}
                </td>
                <td className="p-3.5 sm:p-4 leading-relaxed text-[#141413] dark:text-[#f3f3f0]">
                  {modelB.architecture}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Verified Strengths Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-5 sm:p-6 rounded-xl border border-[#e8e8e6] dark:border-[#222220] bg-[var(--background)]">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#e8e8e6] dark:border-[#222220]">
            <h4 className="font-serif font-bold text-base text-[#141413] dark:text-[#f3f3f0]">
              {modelA.name} Strengths
            </h4>
            <Link
              href={`/models/${modelA.id}`}
              className="text-xs text-[#6b7280] dark:text-[#9ca3af] hover:text-black dark:hover:text-white flex items-center gap-1 font-medium underline"
            >
              <span>Full Profile</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <ul className="space-y-2 text-xs">
            {modelA.strengths.map((str, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-black dark:text-white shrink-0 mt-0.5" />
                <span className="text-[#374151] dark:text-[#d1d5db] font-medium">{str}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 pt-3 border-t border-[#f0f0ee] dark:border-[#20201e] text-xs text-[#6b7280] dark:text-[#9ca3af] leading-relaxed">
            {modelA.description}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <a
              href={modelA.officialUrl}
              target="_blank"
              rel="noopener nofollow"
              className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded bg-[#141413] text-white dark:bg-[#f3f3f0] dark:text-[#141413]"
            >
              <span>Official Overview</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            {modelA.huggingFaceUrl && (
              <a
                href={modelA.huggingFaceUrl}
                target="_blank"
                rel="noopener nofollow"
                className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded border border-[#e8e8e6] dark:border-[#242422] text-[#6b7280] dark:text-[#9ca3af]"
              >
                <span>Hugging Face</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>

        <div className="p-5 sm:p-6 rounded-xl border border-[#e8e8e6] dark:border-[#222220] bg-[var(--background)]">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#e8e8e6] dark:border-[#222220]">
            <h4 className="font-serif font-bold text-base text-[#141413] dark:text-[#f3f3f0]">
              {modelB.name} Strengths
            </h4>
            <Link
              href={`/models/${modelB.id}`}
              className="text-xs text-[#6b7280] dark:text-[#9ca3af] hover:text-black dark:hover:text-white flex items-center gap-1 font-medium underline"
            >
              <span>Full Profile</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <ul className="space-y-2 text-xs">
            {modelB.strengths.map((str, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-[#374151] dark:text-[#d1d5db] font-medium">{str}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 pt-3 border-t border-[#f0f0ee] dark:border-[#20201e] text-xs text-[#6b7280] dark:text-[#9ca3af] leading-relaxed">
            {modelB.description}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <a
              href={modelB.officialUrl}
              target="_blank"
              rel="noopener nofollow"
              className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded bg-[#141413] text-white dark:bg-[#f3f3f0] dark:text-[#141413]"
            >
              <span>Official Overview</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            {modelB.huggingFaceUrl && (
              <a
                href={modelB.huggingFaceUrl}
                target="_blank"
                rel="noopener nofollow"
                className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded border border-[#e8e8e6] dark:border-[#242422] text-[#6b7280] dark:text-[#9ca3af]"
              >
                <span>Hugging Face</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
