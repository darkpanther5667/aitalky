"use client";

import React, { useState, useMemo } from "react";
import { AIModel, ModelModality, ModelAccessType } from "@/types/model";
import { MODALITY_CONFIG, LAB_OPTIONS } from "@/lib/models-data";
import {
  Search,
  X,
  ExternalLink,
  Code,
  Layers,
  Cpu,
  Shield,
  Calendar,
  Sparkles,
  Info,
  CheckCircle2,
  SlidersHorizontal,
} from "lucide-react";

interface ModelsDirectoryClientProps {
  initialModels: AIModel[];
}

export function ModelsDirectoryClient({ initialModels }: ModelsDirectoryClientProps) {
  const [search, setSearch] = useState("");
  const [selectedModality, setSelectedModality] = useState<ModelModality | "all">("all");
  const [selectedAccess, setSelectedAccess] = useState<ModelAccessType | "all">("all");
  const [selectedLab, setSelectedLab] = useState<string>("All Labs");
  const [selectedModelForModal, setSelectedModelForModal] = useState<AIModel | null>(null);

  // Filtered models
  const filteredModels = useMemo(() => {
    return initialModels.filter((model) => {
      // Search
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchesName = model.name.toLowerCase().includes(query);
        const matchesLab = model.lab.toLowerCase().includes(query);
        const matchesTagline = model.tagline.toLowerCase().includes(query);
        const matchesDesc = model.description.toLowerCase().includes(query);
        const matchesStrengths = model.strengths.some((s) => s.toLowerCase().includes(query));
        const matchesArch = model.architecture.toLowerCase().includes(query);
        if (!matchesName && !matchesLab && !matchesTagline && !matchesDesc && !matchesStrengths && !matchesArch) {
          return false;
        }
      }

      // Modality
      if (selectedModality !== "all" && model.modality !== selectedModality) {
        return false;
      }

      // Access Type
      if (selectedAccess !== "all" && model.accessType !== selectedAccess) {
        return false;
      }

      // Lab
      if (selectedLab !== "All Labs" && model.lab !== selectedLab) {
        return false;
      }

      return true;
    });
  }, [initialModels, search, selectedModality, selectedAccess, selectedLab]);

  const activeFiltersCount =
    (selectedModality !== "all" ? 1 : 0) +
    (selectedAccess !== "all" ? 1 : 0) +
    (selectedLab !== "All Labs" ? 1 : 0) +
    (search ? 1 : 0);

  const resetFilters = () => {
    setSearch("");
    setSelectedModality("all");
    setSelectedAccess("all");
    setSelectedLab("All Labs");
  };

  return (
    <div className="space-y-8">
      {/* Controls Bar */}
      <section className="bg-[#fafaf8] dark:bg-[#161614] border border-[#e8e8e6] dark:border-[#222220] rounded-xl p-4 sm:p-6 space-y-5">
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9ca3af]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by model name, laboratory, architecture, or capability..."
              className="w-full bg-[var(--background)] border border-[#e8e8e6] dark:border-[#222220] focus:border-black dark:focus:border-white rounded-lg pl-10 pr-9 py-2 text-xs sm:text-sm text-[#141413] dark:text-[#f3f3f0] placeholder:text-[#9ca3af] focus:outline-none transition-colors"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-black dark:hover:text-white p-1"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Lab Select Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#6b7280] dark:text-[#9ca3af] font-medium hidden sm:inline whitespace-nowrap">
              Lab:
            </span>
            <select
              value={selectedLab}
              onChange={(e) => setSelectedLab(e.target.value)}
              className="bg-[var(--background)] border border-[#e8e8e6] dark:border-[#222220] text-xs font-medium text-[#141413] dark:text-[#f3f3f0] rounded-lg px-3 py-2 focus:outline-none focus:border-black dark:focus:border-white cursor-pointer"
            >
              {LAB_OPTIONS.map((lab) => (
                <option key={lab} value={lab}>
                  {lab}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-[#f0f0ee] dark:border-[#1e1e1c]">
          {/* Modality Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 sm:pb-0">
            <button
              onClick={() => setSelectedModality("all")}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition cursor-pointer whitespace-nowrap ${
                selectedModality === "all"
                  ? "bg-[#141413] text-white dark:bg-[#f3f3f0] dark:text-[#141413]"
                  : "bg-transparent text-[#6b7280] dark:text-[#9ca3af] hover:text-black dark:hover:text-white hover:bg-[#eaeae6] dark:hover:bg-[#222220]"
              }`}
            >
              All Modalities
            </button>
            {(["reasoning", "multimodal", "code", "vision_video", "audio"] as ModelModality[]).map((mod) => (
              <button
                key={mod}
                onClick={() => setSelectedModality(mod)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition cursor-pointer whitespace-nowrap ${
                  selectedModality === mod
                    ? "bg-[#141413] text-white dark:bg-[#f3f3f0] dark:text-[#141413]"
                    : "bg-transparent text-[#6b7280] dark:text-[#9ca3af] hover:text-black dark:hover:text-white hover:bg-[#eaeae6] dark:hover:bg-[#222220]"
                }`}
              >
                {MODALITY_CONFIG[mod]?.label || mod}
              </button>
            ))}
          </div>

          {/* Access Type Switcher */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setSelectedAccess("all")}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition cursor-pointer ${
                selectedAccess === "all"
                  ? "bg-[#e5e5e3] dark:bg-[#282826] text-black dark:text-white font-semibold"
                  : "text-[#6b7280] dark:text-[#9ca3af] hover:text-black dark:hover:text-white"
              }`}
            >
              All Access
            </button>
            <button
              onClick={() => setSelectedAccess("open_weights")}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition cursor-pointer ${
                selectedAccess === "open_weights"
                  ? "bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 font-semibold border border-emerald-300 dark:border-emerald-800"
                  : "text-[#6b7280] dark:text-[#9ca3af] hover:text-black dark:hover:text-white"
              }`}
            >
              Open Weights
            </button>
            <button
              onClick={() => setSelectedAccess("commercial_api")}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition cursor-pointer ${
                selectedAccess === "commercial_api"
                  ? "bg-blue-100 dark:bg-blue-950/70 text-blue-800 dark:text-blue-300 font-semibold border border-blue-300 dark:border-blue-800"
                  : "text-[#6b7280] dark:text-[#9ca3af] hover:text-black dark:hover:text-white"
              }`}
            >
              Commercial API
            </button>
          </div>
        </div>
      </section>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-[#6b7280] dark:text-[#9ca3af] px-1">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>
            Showing <strong className="text-[#141413] dark:text-[#f3f3f0]">{filteredModels.length}</strong> of{" "}
            {initialModels.length} cataloged frontier models
          </span>
        </div>

        {activeFiltersCount > 0 && (
          <button
            onClick={resetFilters}
            className="text-xs text-[#dc2626] dark:text-rose-400 hover:underline cursor-pointer"
          >
            Reset all filters
          </button>
        )}
      </div>

      {/* Grid of Models */}
      {filteredModels.length === 0 ? (
        <div className="text-center py-16 px-4 bg-[#fafaf8] dark:bg-[#161614] border border-[#e8e8e6] dark:border-[#222220] rounded-xl">
          <Info className="w-8 h-8 mx-auto text-[#9ca3af] mb-3" />
          <h3 className="font-serif text-lg font-bold text-[#141413] dark:text-[#f3f3f0] mb-1">
            No AI models matched your criteria
          </h3>
          <p className="text-xs text-[#6b7280] dark:text-[#9ca3af] max-w-sm mx-auto mb-4">
            Try adjusting your search keywords, clearing specific modality filters, or resetting the provider selection.
          </p>
          <button
            onClick={resetFilters}
            className="px-4 py-1.5 rounded-lg bg-[#141413] text-white dark:bg-[#f3f3f0] dark:text-[#141413] text-xs font-medium cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredModels.map((model) => {
            const modalityMeta = MODALITY_CONFIG[model.modality];
            const isOpenWeights = model.accessType === "open_weights";

            return (
              <article
                key={model.id}
                className="group relative rounded-xl border border-[#e8e8e6] dark:border-[#222220] bg-[var(--background)] hover:border-[#b5b5b0] dark:hover:border-[#383834] transition-all p-5 sm:p-6 flex flex-col justify-between shadow-xs hover:shadow-md"
              >
                <div>
                  {/* Top Badges & Meta */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-semibold text-[#141413] dark:text-[#f3f3f0] uppercase tracking-wider">
                        {model.lab}
                      </span>
                      <span className="text-neutral-300 dark:text-neutral-700">•</span>
                      <span
                        className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${
                          modalityMeta?.badgeColor || "bg-neutral-100 text-neutral-800"
                        }`}
                      >
                        {modalityMeta?.label || model.modality}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {model.featured && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40">
                          <Sparkles className="w-2.5 h-2.5" />
                          Frontier
                        </span>
                      )}
                      <span
                        className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${
                          isOpenWeights
                            ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60"
                            : "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700"
                        }`}
                      >
                        {isOpenWeights ? "Open Weights" : "Commercial API"}
                      </span>
                    </div>
                  </div>

                  {/* Title & Tagline */}
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#141413] dark:text-[#f3f3f0] mb-1.5 group-hover:text-black dark:group-hover:text-white transition">
                    {model.name}
                  </h3>
                  <p className="text-xs sm:text-sm font-serif text-[#4b5563] dark:text-[#9ca3af] leading-relaxed mb-4">
                    {model.tagline}
                  </p>

                  {/* Specifications Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 py-3 px-3 rounded-lg bg-[#fafaf8] dark:bg-[#161614] border border-[#f0f0ee] dark:border-[#222220] mb-4 text-[11px]">
                    <div>
                      <span className="text-[#9ca3af] block text-[10px] uppercase font-mono">Parameters</span>
                      <span className="font-medium text-[#141413] dark:text-[#f3f3f0] truncate block" title={model.parameters}>
                        {model.parameters}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#9ca3af] block text-[10px] uppercase font-mono">Context</span>
                      <span className="font-medium text-[#141413] dark:text-[#f3f3f0] truncate block" title={model.contextWindow}>
                        {model.contextWindow}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#9ca3af] block text-[10px] uppercase font-mono">License</span>
                      <span className="font-medium text-[#141413] dark:text-[#f3f3f0] truncate block" title={model.license}>
                        {model.license}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#9ca3af] block text-[10px] uppercase font-mono">Released</span>
                      <span className="font-medium text-[#141413] dark:text-[#f3f3f0] truncate block">
                        {model.releaseDate}
                      </span>
                    </div>
                  </div>

                  {/* Strengths Pills */}
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {model.strengths.map((str, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-[#f4f4f2] dark:bg-[#1a1a18] text-[#4b5563] dark:text-[#9ca3af] border border-[#e8e8e6] dark:border-[#262624]"
                      >
                        <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        {str}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Actions & Links */}
                <div className="pt-4 border-t border-[#f0f0ee] dark:border-[#1e1e1c] flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex flex-wrap items-center gap-2">
                    <a
                      href={model.officialUrl}
                      target="_blank"
                      rel="noopener nofollow"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#141413] text-white dark:bg-[#f3f3f0] dark:text-[#141413] hover:opacity-90 transition font-medium text-[11px]"
                    >
                      <span>Overview</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>

                    {model.huggingFaceUrl && (
                      <a
                        href={model.huggingFaceUrl}
                        target="_blank"
                        rel="noopener nofollow"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-[#e8e8e6] dark:border-[#2a2a28] hover:border-black dark:hover:border-white text-[#4b5563] dark:text-[#9ca3af] hover:text-black dark:hover:text-white transition font-medium text-[11px]"
                      >
                        <span>Hugging Face</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}

                    {model.apiDocUrl && (
                      <a
                        href={model.apiDocUrl}
                        target="_blank"
                        rel="noopener nofollow"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-[#e8e8e6] dark:border-[#2a2a28] hover:border-black dark:hover:border-white text-[#4b5563] dark:text-[#9ca3af] hover:text-black dark:hover:text-white transition font-medium text-[11px]"
                      >
                        <span>API Docs</span>
                        <Code className="w-3 h-3" />
                      </a>
                    )}
                  </div>

                  <button
                    onClick={() => setSelectedModelForModal(model)}
                    className="text-xs text-[#6b7280] dark:text-[#9ca3af] hover:text-black dark:hover:text-white font-medium underline underline-offset-2 cursor-pointer"
                  >
                    Technical Specs →
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Technical Detail Modal */}
      {selectedModelForModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
          onClick={() => setSelectedModelForModal(null)}
        >
          <div
            className="bg-[var(--background)] border border-[#e8e8e6] dark:border-[#2a2a28] rounded-2xl max-w-2xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#e8e8e6] dark:border-[#222220]">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs uppercase tracking-wider font-semibold text-[#6b7280] dark:text-[#9ca3af]">
                    {selectedModelForModal.lab}
                  </span>
                  <span className="text-neutral-300 dark:text-neutral-700">•</span>
                  <span className="text-xs text-[#6b7280] dark:text-[#9ca3af]">
                    {selectedModelForModal.releaseDate}
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#141413] dark:text-[#f3f3f0]">
                  {selectedModelForModal.name}
                </h2>
              </div>
              <button
                onClick={() => setSelectedModelForModal(null)}
                className="p-1 rounded-md text-[#9ca3af] hover:text-black dark:hover:text-white hover:bg-[#f4f4f2] dark:hover:bg-[#1f1f1d] cursor-pointer"
                aria-label="Close details"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="py-5 space-y-6">
              <div>
                <h4 className="text-xs uppercase tracking-wider font-mono text-[#9ca3af] mb-1.5">
                  Editorial Abstract &amp; Architecture
                </h4>
                <p className="text-sm font-serif leading-relaxed text-[#374151] dark:text-[#d1d5db]">
                  {selectedModelForModal.description}
                </p>
              </div>

              {/* Technical Specifications Specs Sheet */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-[#fafaf8] dark:bg-[#161614] border border-[#e8e8e6] dark:border-[#222220] text-xs">
                <div>
                  <span className="text-[#9ca3af] block font-mono text-[10px] uppercase">Neural Architecture</span>
                  <span className="font-medium text-[#141413] dark:text-[#f3f3f0] block mt-0.5">
                    {selectedModelForModal.architecture}
                  </span>
                </div>
                <div>
                  <span className="text-[#9ca3af] block font-mono text-[10px] uppercase">Parameter Scale</span>
                  <span className="font-medium text-[#141413] dark:text-[#f3f3f0] block mt-0.5">
                    {selectedModelForModal.parameters}
                  </span>
                </div>
                <div>
                  <span className="text-[#9ca3af] block font-mono text-[10px] uppercase">Context Window Limit</span>
                  <span className="font-medium text-[#141413] dark:text-[#f3f3f0] block mt-0.5">
                    {selectedModelForModal.contextWindow}
                  </span>
                </div>
                <div>
                  <span className="text-[#9ca3af] block font-mono text-[10px] uppercase">License &amp; Availability</span>
                  <span className="font-medium text-[#141413] dark:text-[#f3f3f0] block mt-0.5">
                    {selectedModelForModal.license} ({selectedModelForModal.accessType === "open_weights" ? "Open Weights" : "Commercial API"})
                  </span>
                </div>
              </div>

              {/* Key Competencies */}
              <div>
                <h4 className="text-xs uppercase tracking-wider font-mono text-[#9ca3af] mb-2">
                  Verified Key Capabilities
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedModelForModal.strengths.map((str, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg border border-[#e8e8e6] dark:border-[#222220] bg-[var(--background)] flex items-center gap-2 text-xs text-[#141413] dark:text-[#f3f3f0]"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>{str}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* External Links */}
              <div className="pt-4 border-t border-[#e8e8e6] dark:border-[#222220] flex flex-wrap items-center gap-3">
                <a
                  href={selectedModelForModal.officialUrl}
                  target="_blank"
                  rel="noopener nofollow"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#141413] text-white dark:bg-[#f3f3f0] dark:text-[#141413] hover:opacity-90 transition font-medium text-xs"
                >
                  <span>Official Research / Announcement</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                {selectedModelForModal.huggingFaceUrl && (
                  <a
                    href={selectedModelForModal.huggingFaceUrl}
                    target="_blank"
                    rel="noopener nofollow"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[#e8e8e6] dark:border-[#2a2a28] hover:border-black dark:hover:border-white text-[#4b5563] dark:text-[#9ca3af] hover:text-black dark:hover:text-white transition font-medium text-xs"
                  >
                    <span>Hugging Face Repository</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}

                {selectedModelForModal.apiDocUrl && (
                  <a
                    href={selectedModelForModal.apiDocUrl}
                    target="_blank"
                    rel="noopener nofollow"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[#e8e8e6] dark:border-[#2a2a28] hover:border-black dark:hover:border-white text-[#4b5563] dark:text-[#9ca3af] hover:text-black dark:hover:text-white transition font-medium text-xs"
                  >
                    <span>API Reference Documentation</span>
                    <Code className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
