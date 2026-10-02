import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { AI_MODELS, MODALITY_CONFIG } from "@/lib/models-data";
import { MODEL_BENCHMARKS, POPULAR_COMPARISONS } from "@/lib/benchmarks-data";
import { BenchmarkChart, BenchmarkComparisonItem } from "@/components/BenchmarkChart";
import { EditorialFooter } from "@/components/EditorialFooter";
import { Logo } from "@/components/Logo";
import {
  ArrowLeft,
  ExternalLink,
  Code,
  CheckCircle2,
  Cpu,
  Layers,
  ShieldCheck,
  Calendar,
  Sparkles,
  ArrowRight,
  ArrowRightLeft,
} from "lucide-react";

export const revalidate = 3600; // 1-hour ISR

export async function generateStaticParams() {
  return AI_MODELS.map((model) => ({
    id: model.id,
  }));
}

interface ModelPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ModelPageProps): Promise<Metadata> {
  const { id } = await params;
  const model = AI_MODELS.find((m) => m.id === id);

  if (!model) {
    return {
      title: "Model Not Found — aitalky",
    };
  }

  const title = `${model.name} (${model.lab}) — Architecture, Context & Benchmarks | aitalky`;
  const description = `${model.name} technical specifications: ${model.parameters} parameters, ${model.contextWindow} context window, ${model.license} license. ${model.tagline}`;
  const canonicalUrl = `https://aitalky.vercel.app/models/${model.id}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: "aitalky",
      images: [
        {
          url: "https://aitalky.vercel.app/og-default.png",
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["https://aitalky.vercel.app/og-default.png"],
    },
  };
}

export default async function ModelProfilePage({ params }: ModelPageProps) {
  const { id } = await params;
  const model = AI_MODELS.find((m) => m.id === id);

  if (!model) {
    notFound();
  }

  const modalityMeta = MODALITY_CONFIG[model.modality];
  const isOpenWeights = model.accessType === "open_weights";
  const benchmarkData = MODEL_BENCHMARKS[model.id];

  // Compile benchmark items if model has benchmark data
  const benchmarkItems: BenchmarkComparisonItem[] = [];
  if (benchmarkData?.scores) {
    const keys = ["math500", "gpqa", "mmlu_pro", "swe_bench", "humaneval"] as const;
    for (const k of keys) {
      const score = benchmarkData.scores[k];
      if (typeof score === "number") {
        benchmarkItems.push({
          benchmarkId: k,
          scoreA: score,
        });
      }
    }
  }

  // Find related comparisons involving this model
  const relatedComparisons = POPULAR_COMPARISONS.filter(
    (c) => c.modelAId === model.id || c.modelBId === model.id
  );

  // Suggested peer models for comparison
  const peerModels = AI_MODELS.filter(
    (m) => m.id !== model.id && (m.modality === model.modality || m.lab === model.lab)
  ).slice(0, 3);

  // Schema.org structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: model.name,
    operatingSystem: "Cloud API / Local Machine Inference",
    applicationCategory: "MachineLearningApplication",
    creator: {
      "@type": "Organization",
      name: model.lab,
    },
    description: model.description,
    url: model.officialUrl,
    offers: {
      "@type": "Offer",
      price: isOpenWeights ? "0" : "Usage-based",
      priceCurrency: "USD",
    },
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] font-sans antialiased flex flex-col transition-colors">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Top Header / Breadcrumb */}
      <header className="border-b border-[#e8e8e6] dark:border-[#222220] py-4 px-4 sm:px-6 sticky top-0 bg-[var(--background)]/90 backdrop-blur-md z-30">
        <div className="max-w-5xl mx-auto flex items-center justify-between text-xs text-[#6b7280] dark:text-[#9ca3af]">
          <div className="flex items-center gap-4">
            <Link
              href="/models"
              className="inline-flex items-center gap-1.5 hover:text-black dark:hover:text-white transition-colors font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Models Directory</span>
            </Link>
            <span className="text-neutral-300 dark:text-neutral-700">•</span>
            <Logo size="sm" showSubtitle={false} />
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/models/compare"
              className="inline-flex items-center gap-1 font-medium text-amber-700 dark:text-amber-400 hover:underline"
            >
              <ArrowRightLeft className="w-3 h-3" />
              <span>Compare Models</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Model Profile Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-12">
        {/* Model Hero Masthead */}
        <section className="pb-8 border-b border-[#e8e8e6] dark:border-[#222220]">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="text-xs uppercase tracking-widest font-mono font-semibold text-[#6b7280] dark:text-[#9ca3af]">
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
            <span
              className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${
                isOpenWeights
                  ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60"
                  : "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700"
              }`}
            >
              {isOpenWeights ? "Open Weights" : "Commercial API"}
            </span>
            {model.featured && (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40">
                <Sparkles className="w-2.5 h-2.5" />
                Frontier Milestone
              </span>
            )}
          </div>

          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-[#141413] dark:text-[#f3f3f0] leading-tight mb-4">
            {model.name}
          </h1>

          <p className="text-base sm:text-xl font-serif text-[#4b5563] dark:text-[#9ca3af] leading-relaxed max-w-3xl mb-6">
            {model.tagline}
          </p>

          {/* Action Outbound Links */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <a
              href={model.officialUrl}
              target="_blank"
              rel="noopener nofollow"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#141413] text-white dark:bg-[#f3f3f0] dark:text-[#141413] font-medium text-xs hover:opacity-90 transition"
            >
              <span>Official Paper / Announcement</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            {model.huggingFaceUrl && (
              <a
                href={model.huggingFaceUrl}
                target="_blank"
                rel="noopener nofollow"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[#e8e8e6] dark:border-[#2a2a28] hover:border-black dark:hover:border-white text-[#4b5563] dark:text-[#9ca3af] hover:text-black dark:hover:text-white font-medium text-xs transition"
              >
                <span>Hugging Face Weights</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}

            {model.apiDocUrl && (
              <a
                href={model.apiDocUrl}
                target="_blank"
                rel="noopener nofollow"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[#e8e8e6] dark:border-[#2a2a28] hover:border-black dark:hover:border-white text-[#4b5563] dark:text-[#9ca3af] hover:text-black dark:hover:text-white font-medium text-xs transition"
              >
                <span>Developer API Docs</span>
                <Code className="w-3.5 h-3.5" />
              </a>
            )}

            <Link
              href={`/models/compare?a=${model.id}`}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 font-medium text-xs hover:bg-amber-100 transition"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>Compare with Another Model</span>
            </Link>
          </div>
        </section>

        {/* Specifications Matrix Grid */}
        <section>
          <h2 className="text-xs uppercase tracking-widest font-mono font-semibold text-[#6b7280] dark:text-[#9ca3af] mb-4">
            Technical Specification Matrix
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 p-4 sm:p-5 rounded-xl bg-[#fafaf8] dark:bg-[#161614] border border-[#e8e8e6] dark:border-[#222220] text-xs">
            <div>
              <span className="text-[#9ca3af] block font-mono text-[10px] uppercase">Parameters</span>
              <span className="font-semibold text-sm text-[#141413] dark:text-[#f3f3f0] block mt-0.5">
                {model.parameters}
              </span>
            </div>
            <div>
              <span className="text-[#9ca3af] block font-mono text-[10px] uppercase">Context Window</span>
              <span className="font-semibold text-sm text-[#141413] dark:text-[#f3f3f0] block mt-0.5">
                {model.contextWindow}
              </span>
            </div>
            <div>
              <span className="text-[#9ca3af] block font-mono text-[10px] uppercase">Access Model</span>
              <span className="font-semibold text-sm text-[#141413] dark:text-[#f3f3f0] block mt-0.5">
                {isOpenWeights ? "Open Weights" : "Commercial API"}
              </span>
            </div>
            <div>
              <span className="text-[#9ca3af] block font-mono text-[10px] uppercase">License</span>
              <span className="font-semibold text-sm text-[#141413] dark:text-[#f3f3f0] block mt-0.5">
                {model.license}
              </span>
            </div>
            <div>
              <span className="text-[#9ca3af] block font-mono text-[10px] uppercase">Release Date</span>
              <span className="font-semibold text-sm text-[#141413] dark:text-[#f3f3f0] block mt-0.5">
                {model.releaseDate}
              </span>
            </div>
            <div>
              <span className="text-[#9ca3af] block font-mono text-[10px] uppercase">Author Lab</span>
              <span className="font-semibold text-sm text-[#141413] dark:text-[#f3f3f0] block mt-0.5">
                {model.lab}
              </span>
            </div>
          </div>
        </section>

        {/* Architecture & Technical Abstract */}
        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#141413] dark:text-[#f3f3f0]">
            Architecture &amp; Engineering Overview
          </h2>
          <div className="p-5 sm:p-6 rounded-xl border border-[#e8e8e6] dark:border-[#222220] bg-[var(--background)] space-y-4">
            <div>
              <span className="text-xs uppercase font-mono tracking-wider text-[#9ca3af] block mb-1">
                Underlying Neural Architecture
              </span>
              <p className="text-sm font-serif text-[#141413] dark:text-[#f3f3f0] font-medium leading-relaxed">
                {model.architecture}
              </p>
            </div>
            <div className="pt-3 border-t border-[#f0f0ee] dark:border-[#222220]">
              <span className="text-xs uppercase font-mono tracking-wider text-[#9ca3af] block mb-1">
                Editorial Analysis
              </span>
              <p className="text-sm sm:text-base font-serif text-[#374151] dark:text-[#d1d5db] leading-relaxed">
                {model.description}
              </p>
            </div>
          </div>
        </section>

        {/* Verified Academic Benchmarks (if available) */}
        {benchmarkItems.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#141413] dark:text-[#f3f3f0]">
              Empirical Academic Benchmarks
            </h2>
            <BenchmarkChart
              modelAName={model.name}
              items={benchmarkItems}
              title={`${model.name} Benchmark Performance`}
              subtitle={benchmarkData?.notes || "Primary academic benchmark scores from official technical publications."}
            />
          </section>
        )}

        {/* Verified Capabilities & Strengths */}
        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#141413] dark:text-[#f3f3f0]">
            Verified Core Competencies
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {model.strengths.map((str, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-[#e8e8e6] dark:border-[#222220] bg-[#fafaf8] dark:bg-[#161614] flex items-center gap-3"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="text-xs sm:text-sm font-medium text-[#141413] dark:text-[#f3f3f0]">
                  {str}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Direct Comparison Showdowns */}
        {relatedComparisons.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#141413] dark:text-[#f3f3f0]">
              Head-to-Head Comparisons
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {relatedComparisons.map((comp) => (
                <Link
                  key={comp.slug}
                  href={`/models/compare/${comp.slug}`}
                  className="p-5 rounded-xl border border-[#e8e8e6] dark:border-[#222220] bg-[var(--background)] hover:border-black dark:hover:border-white transition block group"
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-xs font-mono uppercase text-amber-700 dark:text-amber-400">
                      Comparison Duel
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#9ca3af] group-hover:translate-x-1 transition" />
                  </div>
                  <h3 className="font-serif font-bold text-base text-[#141413] dark:text-[#f3f3f0] mb-1">
                    {comp.title}
                  </h3>
                  <p className="text-xs text-[#6b7280] dark:text-[#9ca3af] line-clamp-2">
                    {comp.summary}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Peer Models in Same Category */}
        <section className="pt-6 border-t border-[#e8e8e6] dark:border-[#222220]">
          <h2 className="text-sm uppercase tracking-wider font-mono font-semibold text-[#6b7280] dark:text-[#9ca3af] mb-4">
            Related Frontier Architectures
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {peerModels.map((peer) => (
              <Link
                key={peer.id}
                href={`/models/${peer.id}`}
                className="p-4 rounded-xl border border-[#e8e8e6] dark:border-[#222220] bg-[#fafaf8] dark:bg-[#161614] hover:border-black dark:hover:border-white transition block"
              >
                <span className="text-[10px] font-mono uppercase text-[#9ca3af] block mb-1">
                  {peer.lab}
                </span>
                <h4 className="font-serif font-bold text-sm text-[#141413] dark:text-[#f3f3f0] mb-1">
                  {peer.name}
                </h4>
                <p className="text-xs text-[#6b7280] dark:text-[#9ca3af] line-clamp-2">
                  {peer.tagline}
                </p>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <EditorialFooter />
    </div>
  );
}
