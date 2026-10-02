import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRightLeft, Sparkles, Scale } from "lucide-react";
import { AI_MODELS } from "@/lib/models-data";
import { POPULAR_COMPARISONS } from "@/lib/benchmarks-data";
import { ModelCompareClient } from "@/components/ModelCompareClient";
import { EditorialFooter } from "@/components/EditorialFooter";
import { Logo } from "@/components/Logo";

export const revalidate = 3600; // 1-hour ISR

export const metadata: Metadata = {
  title: "AI Models Head-to-Head Comparison & Benchmarks | aitalky",
  description:
    "Compare the world's leading artificial intelligence models side-by-side. Empirical benchmarks (MATH 500, SWE-bench, GPQA, MMLU-Pro), context windows, parameter scales, and licensing differences across DeepSeek, OpenAI, Anthropic, Google, and Meta.",
  alternates: {
    canonical: "https://aitalky.vercel.app/models/compare",
  },
  openGraph: {
    title: "AI Models Comparison Engine — aitalky",
    description: "Side-by-side architectural specs and verified academic benchmark graphs.",
    url: "https://aitalky.vercel.app/models/compare",
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
    title: "AI Models Comparison & Benchmarks — aitalky",
    description: "Compare verified academic benchmarks and specs side-by-side.",
    images: ["https://aitalky.vercel.app/og-default.png"],
  },
};

interface ComparePageProps {
  searchParams?: Promise<{ a?: string; b?: string }>;
}

export default async function ComparePage({ searchParams }: ComparePageProps) {
  const resolvedParams = searchParams ? await searchParams : {};
  const initialA = resolvedParams.a || "deepseek-r1";
  const initialB = resolvedParams.b || "openai-o1";

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] font-sans antialiased flex flex-col transition-colors">
      {/* Top Header / Breadcrumbs */}
      <header className="border-b border-[#e8e8e6] dark:border-[#222220] py-4 px-4 sm:px-6 sticky top-0 bg-[var(--background)]/90 backdrop-blur-md z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-[#6b7280] dark:text-[#9ca3af]">
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
            <span className="inline-flex items-center gap-1 font-mono text-[11px] uppercase text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
              <Scale className="w-3 h-3" />
              <span>Comparative Workbench</span>
            </span>
          </div>
        </div>
      </header>

      {/* Main Comparison Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-10">
        {/* Masthead */}
        <section className="pb-6 border-b border-[#e8e8e6] dark:border-[#222220]">
          <div className="max-w-3xl">
            <span className="text-xs uppercase tracking-widest font-mono font-semibold text-[#6b7280] dark:text-[#9ca3af] block mb-2.5">
              Head-to-Head Architectural Analysis
            </span>
            <h1 className="text-3xl sm:text-5xl font-serif font-bold text-[#141413] dark:text-[#f3f3f0] leading-tight mb-4">
              AI Models Comparison
            </h1>
            <p className="text-base sm:text-lg font-serif text-[#4b5563] dark:text-[#9ca3af] leading-relaxed">
              Select any two artificial intelligence models to inspect side-by-side differences in neural architecture, context limits, open-weight licensing, and empirical benchmark performance on competition math, PhD science, and software engineering.
            </p>
          </div>
        </section>

        {/* Interactive Comparison Client */}
        <ModelCompareClient
          allModels={AI_MODELS}
          defaultModelAId={initialA}
          defaultModelBId={initialB}
        />
      </main>

      <EditorialFooter />
    </div>
  );
}
