import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Cpu, Sparkles, Database, Layers } from "lucide-react";
import { EditorialFooter } from "@/components/EditorialFooter";
import { Logo } from "@/components/Logo";
import { AI_MODELS } from "@/lib/models-data";
import { ModelsDirectoryClient } from "@/components/ModelsDirectoryClient";

export const revalidate = 3600; // 1-hour ISR

export const metadata: Metadata = {
  title: "AI Models Directory — Frontier Reasoning, LLMs, Vision & Code | aitalky",
  description:
    "Comprehensive, curated directory of the world's leading artificial intelligence models. Compare architectures, context windows, parameter scales, licenses, and official documentation across DeepSeek, Google DeepMind, OpenAI, Anthropic, Meta, and Mistral.",
  alternates: {
    canonical: "https://aitalky.vercel.app/models",
  },
  openGraph: {
    title: "AI Models Directory — The World's Leading AI Models",
    description:
      "Explore and compare verified specifications of frontier reasoning, multimodal, code, vision, and audio AI models.",
    url: "https://aitalky.vercel.app/models",
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
    title: "AI Models Directory — aitalky",
    description: "Compare verified specs, context windows, and licenses for the world's leading AI models.",
    images: ["https://aitalky.vercel.app/og-default.png"],
  },
};

export default function ModelsPage() {
  // Schema.org structured data for SEO & Google Rich Results
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Frontier AI Models Directory",
    description:
      "Authoritative catalog of leading artificial intelligence models, architectures, licenses, and context window limits.",
    url: "https://aitalky.vercel.app/models",
    publisher: {
      "@type": "NewsMediaOrganization",
      name: "aitalky",
      url: "https://aitalky.vercel.app",
    },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: AI_MODELS.length,
      itemListElement: AI_MODELS.map((model, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        item: {
          "@type": "SoftwareApplication",
          name: model.name,
          operatingSystem: "Cloud API / Local Inference",
          applicationCategory: "MachineLearningApplication",
          creator: {
            "@type": "Organization",
            name: model.lab,
          },
          description: model.tagline,
          url: model.officialUrl,
        },
      })),
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
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-[#6b7280] dark:text-[#9ca3af]">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 hover:text-black dark:hover:text-white transition-colors font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to aitalky</span>
            </Link>
            <span className="text-neutral-300 dark:text-neutral-700">•</span>
            <Logo size="sm" showSubtitle={false} />
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-[11px] font-mono uppercase text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
              Verified Specs Index
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-10 sm:py-14">
        {/* Editorial Masthead */}
        <section className="mb-10 pb-8 border-b border-[#e8e8e6] dark:border-[#222220]">
          <div className="max-w-3xl">
            <span className="text-xs uppercase tracking-widest font-mono font-semibold text-[#6b7280] dark:text-[#9ca3af] block mb-2.5">
              Comprehensive Reference Catalog
            </span>
            <h1 className="text-3xl sm:text-5xl font-serif font-bold text-[#141413] dark:text-[#f3f3f0] leading-tight mb-4">
              The World AI Models Directory
            </h1>
            <p className="text-base sm:text-lg font-serif text-[#4b5563] dark:text-[#9ca3af] leading-relaxed">
              An authoritative, curated reference catalog of leading artificial intelligence foundation systems. Track parameters, context window capacities, open-weight licenses, and primary architectural breakthroughs across global research labs.
            </p>
          </div>

          {/* Quick Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-8">
            <div className="p-3.5 sm:p-4 rounded-xl bg-[#fafaf8] dark:bg-[#161614] border border-[#e8e8e6] dark:border-[#222220]">
              <div className="flex items-center gap-2 text-neutral-500 mb-1">
                <Cpu className="w-3.5 h-3.5" />
                <span className="text-[11px] font-mono uppercase">Cataloged</span>
              </div>
              <div className="text-xl sm:text-2xl font-serif font-bold text-[#141413] dark:text-[#f3f3f0]">
                {AI_MODELS.length} Models
              </div>
              <div className="text-[11px] text-[#6b7280] dark:text-[#9ca3af] mt-0.5">
                Frontier architectures
              </div>
            </div>

            <div className="p-3.5 sm:p-4 rounded-xl bg-[#fafaf8] dark:bg-[#161614] border border-[#e8e8e6] dark:border-[#222220]">
              <div className="flex items-center gap-2 text-neutral-500 mb-1">
                <Database className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-[11px] font-mono uppercase">Open Weights</span>
              </div>
              <div className="text-xl sm:text-2xl font-serif font-bold text-emerald-700 dark:text-emerald-400">
                {AI_MODELS.filter((m) => m.accessType === "open_weights").length}
              </div>
              <div className="text-[11px] text-[#6b7280] dark:text-[#9ca3af] mt-0.5">
                MIT, Apache &amp; Open licenses
              </div>
            </div>

            <div className="p-3.5 sm:p-4 rounded-xl bg-[#fafaf8] dark:bg-[#161614] border border-[#e8e8e6] dark:border-[#222220]">
              <div className="flex items-center gap-2 text-neutral-500 mb-1">
                <Layers className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span className="text-[11px] font-mono uppercase">Max Context</span>
              </div>
              <div className="text-xl sm:text-2xl font-serif font-bold text-blue-700 dark:text-blue-400">
                2,000,000
              </div>
              <div className="text-[11px] text-[#6b7280] dark:text-[#9ca3af] mt-0.5">
                Tokens (Gemini 2.0 / 1.5 Pro)
              </div>
            </div>

            <div className="p-3.5 sm:p-4 rounded-xl bg-[#fafaf8] dark:bg-[#161614] border border-[#e8e8e6] dark:border-[#222220]">
              <div className="flex items-center gap-2 text-neutral-500 mb-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span className="text-[11px] font-mono uppercase">Global Labs</span>
              </div>
              <div className="text-xl sm:text-2xl font-serif font-bold text-[#141413] dark:text-[#f3f3f0]">
                14+
              </div>
              <div className="text-[11px] text-[#6b7280] dark:text-[#9ca3af] mt-0.5">
                Pioneering research teams
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Models Explorer Client Island */}
        <ModelsDirectoryClient initialModels={AI_MODELS} />

        {/* Noscript / Static crawler semantic fallback */}
        <noscript>
          <div className="mt-12 pt-8 border-t border-[#e8e8e6] dark:border-[#222220]">
            <h2 className="text-xl font-bold font-serif mb-4">Complete Model Catalog Index</h2>
            <ul className="space-y-4">
              {AI_MODELS.map((m) => (
                <li key={m.id} className="border-b pb-3">
                  <h3 className="font-bold">{m.name} ({m.lab})</h3>
                  <p>{m.description}</p>
                  <p><strong>Parameters:</strong> {m.parameters} | <strong>Context:</strong> {m.contextWindow} | <strong>License:</strong> {m.license}</p>
                  <a href={m.officialUrl} rel="noopener nofollow">Official Documentation</a>
                </li>
              ))}
            </ul>
          </div>
        </noscript>
      </main>

      <EditorialFooter />
    </div>
  );
}
