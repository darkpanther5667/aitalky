import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { AI_MODELS } from "@/lib/models-data";
import {
  POPULAR_COMPARISONS,
  MODEL_BENCHMARKS,
  ComparisonPairMeta,
} from "@/lib/benchmarks-data";
import { BenchmarkChart, BenchmarkComparisonItem } from "@/components/BenchmarkChart";
import { EditorialFooter } from "@/components/EditorialFooter";
import { Logo } from "@/components/Logo";
import {
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  Scale,
  Award,
  ArrowRightLeft,
} from "lucide-react";

export const revalidate = 3600; // 1-hour ISR

export async function generateStaticParams() {
  return POPULAR_COMPARISONS.map((comp) => ({
    pair: comp.slug,
  }));
}

interface PairPageProps {
  params: Promise<{ pair: string }>;
}

export async function generateMetadata({ params }: PairPageProps): Promise<Metadata> {
  const { pair } = await params;
  const comp = POPULAR_COMPARISONS.find((c) => c.slug === pair);

  if (!comp) {
    return {
      title: "Comparison Not Found — aitalky",
    };
  }

  const title = `${comp.title}: Verified Benchmarks & Architectural Differences | aitalky`;
  const description = `${comp.title} head-to-head analysis. ${comp.summary}`;
  const canonicalUrl = `https://aitalky.vercel.app/models/compare/${comp.slug}`;

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

export default async function ComparisonPairPage({ params }: PairPageProps) {
  const { pair } = await params;
  const comp = POPULAR_COMPARISONS.find((c) => c.slug === pair);

  if (!comp) {
    notFound();
  }

  const modelA = AI_MODELS.find((m) => m.id === comp.modelAId);
  const modelB = AI_MODELS.find((m) => m.id === comp.modelBId);

  if (!modelA || !modelB) {
    notFound();
  }

  // Compile benchmark comparison items
  const dataA = MODEL_BENCHMARKS[modelA.id]?.scores;
  const dataB = MODEL_BENCHMARKS[modelB.id]?.scores;

  const benchmarkItems: BenchmarkComparisonItem[] = [];
  const keys = ["math500", "gpqa", "mmlu_pro", "swe_bench", "humaneval"] as const;

  for (const k of keys) {
    const scoreA = dataA?.[k];
    const scoreB = dataB?.[k];
    if (typeof scoreA === "number" || typeof scoreB === "number") {
      benchmarkItems.push({
        benchmarkId: k,
        scoreA,
        scoreB,
      });
    }
  }

  const otherComparisons = POPULAR_COMPARISONS.filter((c) => c.slug !== comp.slug).slice(0, 4);

  // Schema.org structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: `${comp.title} Comparison & Benchmark Analysis`,
    description: comp.summary,
    url: `https://aitalky.vercel.app/models/compare/${comp.slug}`,
    author: {
      "@type": "NewsMediaOrganization",
      name: "aitalky",
      url: "https://aitalky.vercel.app",
    },
    about: [
      {
        "@type": "SoftwareApplication",
        name: modelA.name,
        creator: modelA.lab,
      },
      {
        "@type": "SoftwareApplication",
        name: modelB.name,
        creator: modelB.lab,
      },
    ],
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
              href="/models/compare"
              className="inline-flex items-center gap-1.5 hover:text-black dark:hover:text-white transition-colors font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>All Comparisons</span>
            </Link>
            <span className="text-neutral-300 dark:text-neutral-700">•</span>
            <Link
              href="/models"
              className="hover:text-black dark:hover:text-white transition-colors font-medium"
            >
              Models Directory
            </Link>
          </div>
          <Logo size="sm" showSubtitle={false} />
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-10">
        {/* Masthead */}
        <section className="pb-8 border-b border-[#e8e8e6] dark:border-[#222220]">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs uppercase font-mono tracking-widest text-[#6b7280] dark:text-[#9ca3af]">
              Frontier Model Duel
            </span>
            <span className="text-neutral-300 dark:text-neutral-700">•</span>
            <span className="text-xs text-[#6b7280] dark:text-[#9ca3af]">
              {modelA.lab} vs {modelB.lab}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-[#141413] dark:text-[#f3f3f0] leading-tight mb-3">
            {comp.title}
          </h1>

          <p className="text-base sm:text-xl font-serif text-[#4b5563] dark:text-[#9ca3af] leading-relaxed mb-6">
            {comp.tagline}
          </p>

          <p className="text-sm sm:text-base leading-relaxed text-[#374151] dark:text-[#d1d5db] font-serif mb-6">
            {comp.summary}
          </p>

          {/* Key Takeaways Box */}
          <div className="p-5 rounded-xl bg-[#fafaf8] dark:bg-[#161614] border border-[#e8e8e6] dark:border-[#222220]">
            <h3 className="text-xs font-mono uppercase tracking-wider font-semibold text-[#141413] dark:text-[#f3f3f0] mb-3">
              Key Editorial Takeaways
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm">
              {comp.highlights.map((point, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-[#374151] dark:text-[#d1d5db] leading-relaxed">{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Benchmark Graphs Duel (if available) */}
        {benchmarkItems.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#141413] dark:text-[#f3f3f0]">
              Empirical Benchmark Duel
            </h2>
            <BenchmarkChart
              modelAName={modelA.name}
              modelBName={modelB.name}
              items={benchmarkItems}
              title={`${modelA.name} vs ${modelB.name}`}
              subtitle="Direct side-by-side comparison across competition math, PhD science, general reasoning, and real-world coding benchmarks."
            />
          </section>
        )}

        {/* Side-by-Side Specs Matrix */}
        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#141413] dark:text-[#f3f3f0]">
            Architectural Specification Breakdown
          </h2>
          <div className="rounded-xl border border-[#e8e8e6] dark:border-[#222220] overflow-hidden bg-[#fafaf8] dark:bg-[#161614]">
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
                    <td className="p-3.5 sm:p-4 font-medium text-[#6b7280] dark:text-[#9ca3af]">Research Laboratory</td>
                    <td className="p-3.5 sm:p-4 font-semibold text-[#141413] dark:text-[#f3f3f0]">{modelA.lab}</td>
                    <td className="p-3.5 sm:p-4 font-semibold text-[#141413] dark:text-[#f3f3f0]">{modelB.lab}</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 sm:p-4 font-medium text-[#6b7280] dark:text-[#9ca3af]">Access Model</td>
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
                    <td className="p-3.5 sm:p-4 font-medium text-[#6b7280] dark:text-[#9ca3af]">Neural Architecture</td>
                    <td className="p-3.5 sm:p-4 leading-relaxed text-[#141413] dark:text-[#f3f3f0]">{modelA.architecture}</td>
                    <td className="p-3.5 sm:p-4 leading-relaxed text-[#141413] dark:text-[#f3f3f0]">{modelB.architecture}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Model Profile Cards & Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-5 sm:p-6 rounded-xl border border-[#e8e8e6] dark:border-[#222220] bg-[var(--background)]">
            <h3 className="font-serif font-bold text-lg text-[#141413] dark:text-[#f3f3f0] mb-2">
              {modelA.name}
            </h3>
            <p className="text-xs text-[#6b7280] dark:text-[#9ca3af] leading-relaxed mb-4">
              {modelA.description}
            </p>
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/models/${modelA.id}`}
                className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded bg-[#141413] text-white dark:bg-[#f3f3f0] dark:text-[#141413] font-medium"
              >
                <span>View Full Profile</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
              <a
                href={modelA.officialUrl}
                target="_blank"
                rel="noopener nofollow"
                className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded border border-[#e8e8e6] dark:border-[#2a2a28] text-[#6b7280] dark:text-[#9ca3af]"
              >
                <span>Official Paper</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          <div className="p-5 sm:p-6 rounded-xl border border-[#e8e8e6] dark:border-[#222220] bg-[var(--background)]">
            <h3 className="font-serif font-bold text-lg text-[#141413] dark:text-[#f3f3f0] mb-2">
              {modelB.name}
            </h3>
            <p className="text-xs text-[#6b7280] dark:text-[#9ca3af] leading-relaxed mb-4">
              {modelB.description}
            </p>
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/models/${modelB.id}`}
                className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded bg-[#141413] text-white dark:bg-[#f3f3f0] dark:text-[#141413] font-medium"
              >
                <span>View Full Profile</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
              <a
                href={modelB.officialUrl}
                target="_blank"
                rel="noopener nofollow"
                className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded border border-[#e8e8e6] dark:border-[#2a2a28] text-[#6b7280] dark:text-[#9ca3af]"
              >
                <span>Official Paper</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Other Popular Comparisons */}
        <section className="pt-8 border-t border-[#e8e8e6] dark:border-[#222220]">
          <h2 className="text-sm uppercase tracking-wider font-mono font-semibold text-[#6b7280] dark:text-[#9ca3af] mb-4">
            More Popular Model Comparisons
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {otherComparisons.map((c) => (
              <Link
                key={c.slug}
                href={`/models/compare/${c.slug}`}
                className="p-4 rounded-xl border border-[#e8e8e6] dark:border-[#222220] bg-[#fafaf8] dark:bg-[#161614] hover:border-black dark:hover:border-white transition block group"
              >
                <div className="flex items-center justify-between text-xs font-mono text-[#9ca3af] mb-1">
                  <span>Showdown</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition" />
                </div>
                <h4 className="font-serif font-bold text-sm text-[#141413] dark:text-[#f3f3f0] mb-0.5">
                  {c.title}
                </h4>
                <p className="text-xs text-[#6b7280] dark:text-[#9ca3af] line-clamp-1">
                  {c.tagline}
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
